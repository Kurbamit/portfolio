import { useCallback, useEffect, useMemo, useState } from "react";
import { profile, experience, projects } from "./content";
import { SECTIONS } from "./lib/sections";
import { useTheme } from "./lib/theme";
import StatusBar from "./components/StatusBar";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Stack from "./components/Stack";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";

const openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer");
const sourceUrl = projects.find((p) => p.slug === "portfolio")?.repo ?? profile.links.github;

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const paletteItems = useMemo(() => {
    const { github, linkedin, email } = profile.links;
    return [
      ...SECTIONS.map((s) => ({
        id: `section-${s.id}`,
        group: "Go to",
        label: s.label,
        hint: `/${s.id}`,
        run: () => document.getElementById(s.id)?.scrollIntoView(),
      })),
      ...projects.map((p) => ({
        id: `project-${p.slug}`,
        group: "Projects",
        label: p.title,
        hint: p.stack.join(" / "),
        run: () => openExternal(p.repo),
      })),
      { id: "link-github", group: "Links", label: "GitHub", hint: github.replace(/^https?:\/\//, ""), run: () => openExternal(github) },
      linkedin && { id: "link-linkedin", group: "Links", label: "LinkedIn", hint: "linkedin.com", run: () => openExternal(linkedin) },
      email && { id: "link-email", group: "Links", label: "Email", hint: email, run: () => (window.location.href = `mailto:${email}`) },
      { id: "action-theme", group: "Actions", label: "Toggle theme", hint: theme === "dark" ? "to light" : "to dark", run: toggleTheme },
    ].filter(Boolean);
  }, [theme, toggleTheme]);

  return (
    <div id="top" className="min-h-[100dvh] bg-bg text-fg">
      <StatusBar
        profile={profile}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenPalette={() => setPaletteOpen(true)}
      />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Projects projects={projects} />
        <Experience experience={experience} />
        <Stack skills={profile.skills} />
      </main>
      <Footer profile={profile} sourceUrl={sourceUrl} />
      <CommandPalette open={paletteOpen} onClose={closePalette} items={paletteItems} />
    </div>
  );
}

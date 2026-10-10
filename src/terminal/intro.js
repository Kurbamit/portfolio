// Lines printed by 'whoami'. Shared by the intro view and the opening typing animation.
export function introLines(profile) {
  return [
    { text: profile.name, className: "text-2xl font-semibold tracking-tight md:text-3xl" },
    { text: [profile.role, profile.location].filter(Boolean).join(", "), className: "text-dim" },
    { text: [profile.headline, profile.headlineAccent].filter(Boolean).join(" "), className: "pt-3" },
    { text: profile.tagline, className: "max-w-[70ch] text-dim" },
    { text: "Pick a section below, or type 'help'.", className: "pt-3 text-dim" },
  ];
}

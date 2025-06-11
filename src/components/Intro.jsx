import React from "react";

function Intro() {
  return (
    <div className="flex items-center justify-center flex-col text-center pt-20 pb-6">
      <h1 className="text-4xl md:text-7xl dark:text-white mb-1 md:mb-3 font-bold">
        Dominykas
      </h1>
      <p className="text-base md:text-xl mb-3 font-medium">Software engineer</p>
      <p className="text-sm max-w-xl mb-6 font-bold">
        My name is{" "}
        <a
          href="https://www.linkedin.com/in/dominykas-cernovas/"
          target="_blank"
          className="text-cyan-600 hover:underline underline-offset-2 decoration-2 decoration-red-600"
          rel="noreferrer noopener"
        >
          Dominykas
        </a>{" "}
        and I am a software engineer based in Vilnius, Lithuania. I enjoy
        creating things that live on the internet, whether that be websites,
        applications, or anything in between. I am always learning new things,
        currently those things are .NET and React. You can find me on{" "}
        <a
          href="https://github.com/Kurbamit"
          target="_blank"
          className="text-cyan-600 hover:underline underline-offset-2 decoration-2 decoration-red-600"
          rel="noreferrer noopener"
        >
          Kurbamit Github
        </a>
        .
      </p>
    </div>
  );
}

export default Intro;

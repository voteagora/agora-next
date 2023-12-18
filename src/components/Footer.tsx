import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className=" text-stone-500 pt-4 pb-8 gap-1 flex w-full justify-center text-sm px-4">
      <div className="text-stone-300">&copy;</div>
      <p>
        {new Date().getFullYear()} Agora
        <span className="hidden lg:inline">
          , the onchain governance company
        </span>
      </p>
      <div className="text-stone-300">/</div>
      <a
        href="https://twitter.com/home"
        className="hover:text-stone-700 transition"
        target="_blank"
      >
        Twitter
      </a>
      <div className="text-stone-300">/</div>
      <a
        href="https://github.com/voteagora"
        className="hover:text-stone-700 transition"
        target="_blank"
      >
        Github
      </a>
      <div className="text-stone-300">/</div>
      <a
        href="https://voteagora.com"
        className="hover:text-stone-700 transition"
        target="_blank"
      >
        About
      </a>
    </footer>
  );
};

export default Footer;

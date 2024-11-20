import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="text-secondary gap-1 flex w-full justify-center text-sm pt-4 pb-16 px-4">
      <div className="text-primary/30">&copy;</div>
      <p>
        {new Date().getFullYear()} Agora
        <span className="hidden sm:inline">
          , the onchain governance company
        </span>
      </p>
      <div className="text-primary/30">/</div>
      <a
        href="https://twitter.com/AgoraGovernance"
        className="hover:text-secondary transition"
        target="_blank"
      >
        Twitter
      </a>
      <div className="text-primary/30">/</div>
      <a
        href="https://github.com/voteagora"
        className="hover:text-secondary transition"
        target="_blank"
      >
        Github
      </a>
      <div className="text-primary/30">/</div>
      <a
        href="https://voteagora.com"
        className="hover:text-secondary transition"
        target="_blank"
      >
        About
      </a>
    </footer>
  );
};

export default Footer;

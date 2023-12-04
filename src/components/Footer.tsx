import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className=" text-stone-500 pt-4 pb-8 text-center text-sm">
      <p>&copy; {new Date().getFullYear()} Agora, the onchain governance company</p>
    </footer>
  );
};

export default Footer;
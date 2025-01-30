import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function generateKeys(text: string) {
  const charCount: { [key: string]: number } = {};
  return text.split("").map((char) => {
    if (!charCount[char]) {
      charCount[char] = 0;
    }
    const key = `${char}-${charCount[char]}`;
    charCount[char]++;
    return { char, key };
  });
}

const AnimatedText = ({
  textTo,
  textFrom,
}: {
  textTo: string;
  textFrom: string;
}) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const toggleText = () => {
      setIndex((prevIndex) => (prevIndex + 1) % 2);
    };
    const interval = setInterval(toggleText, 1500);
    return () => clearInterval(interval);
  }, []);

  const textToDisplay = generateKeys(index === 0 ? textTo : textFrom);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {textToDisplay.map(({ char, key }) => (
        <motion.span
          key={key}
          layoutId={key}
          className="inline-block text-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.5,
            type: "spring",
            bounce: 0,
            opacity: {
              duration: 0.5,
              type: "spring",
              bounce: 0,
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </AnimatePresence>
  );
};

export default AnimatedText;

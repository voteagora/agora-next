import { HStack } from "../Layout/Stack";
import * as theme from "@/styles/theme";
import Image from "next/image";
import styles from "./header.module.scss";

export const SocialLinks = () => {
  const isMobile = useMediaQuery({
    query: `(max-width: ${theme.maxWidth.md})`,
  });

  const socialLinks = [
    {
      icon: icons.discord,
      alt: "discord",
      url: "https://discord.gg/FaRy8AMy3Z", // Replace with your Discord URL
    },
    {
      icon: icons.twitter,
      alt: "twitter",
      url: "https://twitter.com/AgoraGovernance", // Replace with your Twitter URL
    },
  ];

  if (isMobile) {
    return null;
  }

  return (
    <HStack gap={3} alignItems="center">
      {socialLinks.map(({ icon, alt, url }, index) => (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.social_link}
        >
          <Image src={icon} alt={alt} />
        </a>
      ))}
    </HStack>
  );
};

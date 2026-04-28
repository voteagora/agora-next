"use client";

import { Button } from "@/components/ui/button";

export default function ForumDiscussAction() {
  const handleClick = () => {
    const commentsSection = document.getElementById("forum-thread-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Button onClick={handleClick} size="lg">
      Discuss
    </Button>
  );
}

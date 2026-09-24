import { describe, expect, it } from "vitest";
import { transformForumTopics } from "./forumUtils";

describe("transformForumTopics", () => {
  it("passes isAuthorDeleted through for topics and comments", () => {
    const [topic] = transformForumTopics([
      {
        id: 1,
        title: "Topic",
        address: "0xabc",
        createdAt: "2026-01-01T00:00:00.000Z",
        isAuthorDeleted: true,
        posts: [
          { id: 10, address: "0xabc", content: "first post" },
          {
            id: 11,
            address: "0xdef",
            content: "reply",
            isAuthorDeleted: true,
          },
        ],
      },
    ]);

    expect(topic.isAuthorDeleted).toBe(true);
    expect(topic.comments[0].isAuthorDeleted).toBe(true);
  });

  it("leaves isAuthorDeleted undefined when not annotated", () => {
    const [topic] = transformForumTopics([
      {
        id: 2,
        title: "Topic",
        address: "0xabc",
        createdAt: "2026-01-01T00:00:00.000Z",
        posts: [
          { id: 20, address: "0xabc", content: "first post" },
          { id: 21, address: "0xdef", content: "reply" },
        ],
      },
    ]);

    expect(topic.isAuthorDeleted).toBeUndefined();
    expect(topic.comments[0].isAuthorDeleted).toBeUndefined();
  });
});

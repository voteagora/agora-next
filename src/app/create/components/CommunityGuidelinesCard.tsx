import { Card, CardContent } from "@/components/ui/card";

export function CommunityGuidelinesCard() {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-gray-600 my-4">
          Welcome to our community forum! Here are some important guidelines to
          ensure a positive experience for everyone:
        </p>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>Be respectful: Treat all members with kindness and consideration.</li>
          <li>Stay on topic: Keep discussions relevant to the forum&apos;s purpose.</li>
          <li>No spam: Avoid posting promotional content or irrelevant links.</li>
          <li>
            Use appropriate language: Keep the conversation friendly and
            professional.
          </li>
        </ol>
        <p className="text-sm text-gray-600 mt-4">
          Thank you for being a part of our community!
        </p>
      </CardContent>
    </Card>
  );
}


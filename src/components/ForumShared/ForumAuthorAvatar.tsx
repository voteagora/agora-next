"use client";

import AvatarImage from "@/components/shared/AvatarImage";
import ENSAvatar from "@/components/shared/ENSAvatar";

type ForumAuthorAvatarProps = {
  address?: string | null;
  avatar?: string | null;
  className?: string;
  size?: number;
};

/**
 * Forum author avatar: prefers the delegate profile image when the author has
 * uploaded one, otherwise falls back to the ENS avatar lookup.
 */
export default function ForumAuthorAvatar({
  address,
  avatar,
  className,
  size = 44,
}: ForumAuthorAvatarProps) {
  if (avatar?.trim()) {
    return (
      <AvatarImage
        src={avatar}
        alt={`${address || "author"} avatar`}
        className={className}
        size={size}
      />
    );
  }

  return (
    <ENSAvatar
      ensName={address ?? undefined}
      className={className}
      size={size}
    />
  );
}

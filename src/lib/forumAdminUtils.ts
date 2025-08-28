export function canArchiveContent(
  userAddress: string,
  contentAuthor: string,
  isAdmin: boolean,
  isModerator: boolean
): boolean {
  const isAuthor = userAddress.toLowerCase() === contentAuthor.toLowerCase();
  return isAuthor || isAdmin || isModerator;
}

export function canDeleteContent(
  userAddress: string,
  contentAuthor: string,
  isAdmin: boolean,
  isModerator: boolean
): boolean {
  const isAuthor = userAddress.toLowerCase() === contentAuthor.toLowerCase();
  return isAuthor || isAdmin || isModerator;
}

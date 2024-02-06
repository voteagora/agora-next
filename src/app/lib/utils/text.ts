/**
 * Clean a string by removing Markdown headings and newlines
 * @param text
 */
export const cleanString = (text: string) => {
  return text
    .replace(/#{1,6}\s/g, "") // Removes Markdown headings
    .replace(/\n/g, " "); // Replaces newlines with space
};

/**
 * Truncate a string to a maximum length
 * @param str
 * @param maxLength
 */
export const truncateString = (str: string, maxLength: number) => {
  return str.length > maxLength ? `${str.substring(0, maxLength - 3)}...` : str;
};
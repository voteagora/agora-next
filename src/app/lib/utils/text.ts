export const cleanString = (text: string) => {
  return text
    .replace(/#{1,6}\s/g, "") // Removes Markdown headings
    .replace(/\n/g, " ") // Replaces newlines with space
    .replace(/&quot;/g, '"') // Decode HTML entity for double quotes
    .replace(/&#39;/g, "'") // Decode HTML entity for single quotes
    .replace(/&amp;/g, "&") // Decode HTML entity for ampersand
    .replace(/&lt;/g, "<") // Decode HTML entity for less than
    .replace(/&gt;/g, ">"); // Decode HTML entity for greater than
};

export const truncateString = (str: string, maxLength: number) => {
  return str.length > maxLength ? `${str.substring(0, maxLength - 3)}...` : str;
};

export const truncateAddress = (address: string) => {
  return (
    address &&
    `${address.substring(0, 4)}...${address.substring(address?.length - 4)}`
  );
};

export const cleanString = (text: string) => {
  return text
    .replace(/#{1,6}\s/g, "") // Removes Markdown headings
    .replace(/\n/g, " "); // Replaces newlines with space
};

export const truncateString = (str: string, maxLength: number) => {
  return str.length > maxLength ? `${str.substring(0, maxLength - 3)}...` : str;
};

export const truncateAddress = (address: string, maxLength: number = 4) => {
  return (
    address &&
    `${address.substring(0, maxLength)}...${address.substring(
      address?.length - maxLength
    )}`
  );
};

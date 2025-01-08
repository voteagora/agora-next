export function rgbStringToHex(rgbString: string | undefined): string {
  if (!rgbString) return "#000000";

  const [r, g, b] = rgbString.split(" ").map(Number);
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

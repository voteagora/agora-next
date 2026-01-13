function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seedRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const colorPalettes = [
  { bg: "#B1CD93", dark: "#7FA05F" },
  { bg: "#7FBCE5", dark: "#4A8FB8" },
  { bg: "#F8D584", dark: "#E5B84A" },
  { bg: "#E5A5A5", dark: "#CC7A7A" },
  { bg: "#B8A5E5", dark: "#9374CC" },
  { bg: "#A5E5D4", dark: "#7ACCBA" },
  { bg: "#F5B8B8", dark: "#E57A7A" },
  { bg: "#B8E5F5", dark: "#7ACCE5" },
  { bg: "#E5D4A5", dark: "#CCBA7A" },
  { bg: "#D4A5E5", dark: "#BA7ACC" },
];

export function generatePatternSvg(
  metadata: string,
  width: number = 400,
  height: number = 280
): { svg: string; bgColor: string } {
  const hash = hashString(metadata);
  const random = seedRandom(hash);

  const colorIndex = hash % colorPalettes.length;
  const colorset = colorPalettes[colorIndex];

  const gridSize = 6;
  const cellSize = width / gridSize;
  const shapes: string[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      const shapeType = Math.floor(random() * 6);
      const fillColor = colorset.dark;
      const scale = cellSize / 480;

      switch (shapeType) {
        case 0:
          shapes.push(
            `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${cellSize / 2}" fill="${fillColor}"/>`
          );
          break;
        case 1:
          shapes.push(
            `<path d="M ${x} ${y} L ${x + cellSize} ${y} L ${x + cellSize / 2} ${y + cellSize} Z" fill="${fillColor}"/>`
          );
          break;
        case 2:
          shapes.push(
            `<path d="M ${x + cellSize / 2} ${y} L ${x + cellSize} ${y + cellSize / 2} L ${x + cellSize / 2} ${y + cellSize} L ${x} ${y + cellSize / 2} Z" fill="${fillColor}"/>`
          );
          break;
        case 3:
          shapes.push(
            `<g fill="${fillColor}" transform="translate(${x}, ${y}) scale(${scale})"><path d="M240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 240 0h120a240 240 0 0 0-240-240Z"></path><path d="M480 0H360a120 120 0 0 1-240 0H0a240 240 0 1 0 480 0Z"></path></g>`
          );
          break;
        case 4:
          shapes.push(
            `<path d="M ${x} ${y + cellSize / 2} A ${cellSize / 2} ${cellSize / 2} 0 0 1 ${x + cellSize} ${y + cellSize / 2} L ${x + cellSize} ${y + cellSize} L ${x} ${y + cellSize} Z" fill="${fillColor}"/>`
          );
          break;
        case 5:
          shapes.push(
            `<path d="M480 0A339.4 339.4 0 0 1 0 0a339.4 339.4 0 0 1 0 480 339.4 339.4 0 0 1 480 0 339.4 339.4 0 0 1 0-480Z" fill="${fillColor}" transform="translate(${x}, ${y}) scale(${scale})"></path>`
          );
          break;
      }
    }
  }

  return {
    svg: `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${shapes.join("\n    ")}
  </svg>`,
    bgColor: colorset.bg,
  };
}

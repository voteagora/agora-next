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
  { bg: "#B1CD93", dark: "#7FA05F", accent: "#95B87A" },
  { bg: "#7FBCE5", dark: "#4A8FB8", accent: "#6BA8D4" },
  { bg: "#F8D584", dark: "#E5B84A", accent: "#F4C96A" },
  { bg: "#E5A5A5", dark: "#CC7A7A", accent: "#D98F8F" },
  { bg: "#B8A5E5", dark: "#9374CC", accent: "#A68FD9" },
  { bg: "#A5E5D4", dark: "#7ACCBA", accent: "#8FD9C8" },
  { bg: "#F5B8B8", dark: "#E57A7A", accent: "#F09A9A" },
  { bg: "#B8E5F5", dark: "#7ACCE5", accent: "#9DD4F0" },
  { bg: "#E5D4A5", dark: "#CCBA7A", accent: "#D9C48F" },
  { bg: "#D4A5E5", dark: "#BA7ACC", accent: "#C98FD9" },
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
      const shapeType = Math.floor(random() * 7);
      const opacity = 0.3 + random() * 0.5;
      const rotation = Math.floor(random() * 4) * 90;
      const scale = cellSize / 480;
      const centerX = x + cellSize / 2;
      const centerY = y + cellSize / 2;

      const useAccent = random() > 0.7;
      const fillColor = useAccent ? colorset.accent : colorset.dark;
      const transform =
        rotation !== 0
          ? `translate(${centerX}, ${centerY}) rotate(${rotation}) translate(${-centerX}, ${-centerY})`
          : "";

      switch (shapeType) {
        case 0:
          shapes.push(
            `<circle cx="${centerX}" cy="${centerY}" r="${cellSize * 0.4}" fill="${fillColor}" opacity="${opacity}"/>`
          );
          break;
        case 1:
          shapes.push(
            `<path d="M ${x} ${y} L ${x + cellSize} ${y} L ${centerX} ${y + cellSize} Z" fill="${fillColor}" opacity="${opacity}"${transform ? ` transform="${transform}"` : ""}/>`
          );
          break;
        case 2:
          shapes.push(
            `<path d="M ${centerX} ${y} L ${x + cellSize} ${centerY} L ${centerX} ${y + cellSize} L ${x} ${centerY} Z" fill="${fillColor}" opacity="${opacity}"${transform ? ` transform="${transform}"` : ""}/>`
          );
          break;
        case 3:
          shapes.push(
            `<g fill="${fillColor}" opacity="${opacity}" transform="translate(${x}, ${y}) scale(${scale})"><path d="M240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 240 0h120a240 240 0 0 0-240-240Z"></path><path d="M480 0H360a120 120 0 0 1-240 0H0a240 240 0 1 0 480 0Z"></path></g>`
          );
          break;
        case 4:
          shapes.push(
            `<path d="M ${x} ${centerY} A ${cellSize * 0.4} ${cellSize * 0.4} 0 0 1 ${x + cellSize} ${centerY} L ${x + cellSize} ${y + cellSize} L ${x} ${y + cellSize} Z" fill="${fillColor}" opacity="${opacity}"${transform ? ` transform="${transform}"` : ""}/>`
          );
          break;
        case 5:
          shapes.push(
            `<path d="M480 0A339.4 339.4 0 0 1 0 0a339.4 339.4 0 0 1 0 480 339.4 339.4 0 0 1 480 0 339.4 339.4 0 0 1 0-480Z" fill="${fillColor}" opacity="${opacity}" transform="translate(${x}, ${y}) scale(${scale})"></path>`
          );
          break;
        case 6:
          const rectSize = cellSize * 0.6;
          const rectX = centerX - rectSize / 2;
          const rectY = centerY - rectSize / 2;
          const cornerRadius = cellSize * 0.15;
          shapes.push(
            `<path d="M ${rectX + cornerRadius} ${rectY} L ${rectX + rectSize - cornerRadius} ${rectY} Q ${rectX + rectSize} ${rectY} ${rectX + rectSize} ${rectY + cornerRadius} L ${rectX + rectSize} ${rectY + rectSize - cornerRadius} Q ${rectX + rectSize} ${rectY + rectSize} ${rectX + rectSize - cornerRadius} ${rectY + rectSize} L ${rectX + cornerRadius} ${rectY + rectSize} Q ${rectX} ${rectY + rectSize} ${rectX} ${rectY + rectSize - cornerRadius} L ${rectX} ${rectY + cornerRadius} Q ${rectX} ${rectY} ${rectX + cornerRadius} ${rectY} Z" fill="${fillColor}" opacity="${opacity}"${transform ? ` transform="${transform}"` : ""}/>`
          );
          break;
      }
    }
  }

  const gradientId = `gradient-${hash}`;

  return {
    svg: `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colorset.bg};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colorset.accent};stop-opacity:0.7" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${gradientId})"/>
    ${shapes.join("\n    ")}
  </svg>`,
    bgColor: colorset.bg,
  };
}

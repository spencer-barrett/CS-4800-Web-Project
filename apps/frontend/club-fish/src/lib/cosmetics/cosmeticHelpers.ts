import { renderHatSVG as renderBaseballHatSVG } from "@/components/svg/baseball-hat";
import { renderTopHatSVG } from "@/components/svg/top-hat";
import { renderBraceletSVG } from "@/components/svg/bracelet";

export function getHatColorFromId(itemId: string): string {
  const colorMap: Record<string, string> = {
    red: '#DC143C',
    blue: '#4169E1',
    black: '#2C2C2C',
    green: '#228B22',
    gray: '#808080',
    grey: '#808080',
  };

  const parts = itemId.split('-');
  const colorName = parts[parts.length - 1]?.toLowerCase();
  return colorMap[colorName] || '#DC143C';
}

export function getHatVariantFromId(itemId: string): 'baseball' | 'tophat' | 'cowboy' {
  if (itemId.includes('tophat')) return 'tophat';
  if (itemId.includes('cowboy')) return 'cowboy';
  return 'baseball';
}

export function isHatItem(itemId: string): boolean {
  return itemId.includes('baseball') || itemId.includes('tophat') || itemId.includes('cowboy');
}

export function renderHatSVGByVariant(itemId: string): string {
  const variant = getHatVariantFromId(itemId);
  const color = getHatColorFromId(itemId);

  switch (variant) {
    case 'tophat':
      return renderTopHatSVG(color);
    case 'baseball':
      return renderBaseballHatSVG(color);
    case 'cowboy':
      return renderBaseballHatSVG(color);
    default:
      return renderBaseballHatSVG(color);
  }
}

// Bracelet helpers
export function getBraceletColorFromId(itemId: string): string {
  const colorMap: Record<string, string> = {
    green: '#00a774',
    blue: '#4169E1',
    red: '#DC143C',
    purple: '#9370DB',
    gold: '#FFD700',
    silver: '#C0C0C0',
  };

  const parts = itemId.split('-');
  const colorName = parts[parts.length - 1]?.toLowerCase();
  return colorMap[colorName] || '#00a774';
}

export function isBraceletItem(itemId: string): boolean {
  return itemId.includes('bracelet');
}

export function renderBraceletSVGById(itemId: string): string {
  const color = getBraceletColorFromId(itemId);
  return renderBraceletSVG(color);
}

export function svgToDataURL(svg: string) {
  const encoded = btoa(
    new TextEncoder()
      .encode(svg)
      .reduce((acc, byte) => acc + String.fromCharCode(byte), "")
  );
  return `data:image/svg+xml;base64,${encoded}`;
}
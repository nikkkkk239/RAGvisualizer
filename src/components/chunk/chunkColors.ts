const PALETTE = [
  "bg-sage border-forest/40",
  "bg-rust/20 border-rust/50",
  "bg-forest/15 border-forest/35",
  "bg-rust/10 border-rust/40",
  "bg-sage/80 border-ink/20",
  "bg-forest/25 border-forest/50",
];

export function chunkColorClass(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export function chunkBarColor(index: number): string {
  const colors = [
    "bg-forest",
    "bg-rust",
    "bg-forest/70",
    "bg-rust/80",
    "bg-ink/50",
    "bg-forest/50",
  ];
  return colors[index % colors.length];
}

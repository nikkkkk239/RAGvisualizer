const PALETTE = [
  "bg-sky-200 border-sky-400",
  "bg-emerald-200 border-emerald-400",
  "bg-amber-200 border-amber-400",
  "bg-violet-200 border-violet-400",
  "bg-rose-200 border-rose-400",
  "bg-cyan-200 border-cyan-400",
];

export function chunkColorClass(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export function chunkBarColor(index: number): string {
  const colors = [
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];
  return colors[index % colors.length];
}

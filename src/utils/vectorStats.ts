export interface VectorStats {
  dimensions: number;
  magnitude: number;
  min: number;
  max: number;
  mean: number;
}

export function computeVectorStats(vector: number[]): VectorStats {
  if (vector.length === 0) {
    return { dimensions: 0, magnitude: 0, min: 0, max: 0, mean: 0 };
  }
  let sum = 0;
  let sumSq = 0;
  let min = vector[0];
  let max = vector[0];
  for (const v of vector) {
    sum += v;
    sumSq += v * v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return {
    dimensions: vector.length,
    magnitude: Math.sqrt(sumSq),
    min,
    max,
    mean: sum / vector.length,
  };
}

/** Values scaled to 0–1 for tiny bar charts (uses max abs). */
export function normalizedPreview(vector: number[], count = 12): number[] {
  const slice = vector.slice(0, count);
  const maxAbs = Math.max(...slice.map((v) => Math.abs(v)), 1e-6);
  return slice.map((v) => Math.abs(v) / maxAbs);
}

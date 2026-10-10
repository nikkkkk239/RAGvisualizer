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

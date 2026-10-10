export type Vec3 = [number, number, number];

type PcaModel = {
  mean: Float64Array;
  axes: Float64Array[];
};

function powerEigen(matrix: number[][]): { value: number; vector: number[] } {
  const n = matrix.length;
  const vector = new Array<number>(n);
  for (let i = 0; i < n; i++) vector[i] = 1 / (i + 1);
  let norm = Math.hypot(...vector);
  for (let i = 0; i < n; i++) vector[i] /= norm;

  for (let iter = 0; iter < 48; iter++) {
    const next = new Array<number>(n).fill(0);
    for (let i = 0; i < n; i++) {
      const row = matrix[i];
      let sum = 0;
      for (let k = 0; k < n; k++) sum += row[k] * vector[k];
      next[i] = sum;
    }
    norm = Math.hypot(...next);
    if (norm < 1e-12) return { value: 0, vector };
    for (let i = 0; i < n; i++) vector[i] = next[i] / norm;
  }

  let value = 0;
  for (let i = 0; i < n; i++) {
    const row = matrix[i];
    let sum = 0;
    for (let k = 0; k < n; k++) sum += row[k] * vector[k];
    value += vector[i] * sum;
  }
  return { value: Math.max(0, value), vector };
}

function fitPca3(vectors: number[][]): PcaModel {
  const n = vectors.length;
  const d = vectors[0]?.length ?? 0;
  const mean = new Float64Array(d);
  if (n === 0 || d === 0) return { mean, axes: [] };

  for (const vector of vectors) {
    for (let j = 0; j < d; j++) mean[j] += vector[j];
  }
  for (let j = 0; j < d; j++) mean[j] /= n;
  if (n < 2) return { mean, axes: [] };

  const centered = vectors.map((vector) => {
    const row = new Float64Array(d);
    for (let j = 0; j < d; j++) row[j] = vector[j] - mean[j];
    return row;
  });

  const gram = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let k = i; k < n; k++) {
      const a = centered[i];
      const b = centered[k];
      let dot = 0;
      for (let j = 0; j < d; j++) dot += a[j] * b[j];
      gram[i][k] = dot;
      gram[k][i] = dot;
    }
  }

  const axes: Float64Array[] = [];
  for (let component = 0; component < 3; component++) {
    const { value, vector } = powerEigen(gram);
    if (value < 1e-8) break;
    const axis = new Float64Array(d);
    const scale = 1 / Math.sqrt(value);
    for (let i = 0; i < n; i++) {
      const weight = vector[i] * scale;
      const row = centered[i];
      for (let j = 0; j < d; j++) axis[j] += row[j] * weight;
    }
    let axisNorm = 0;
    for (let j = 0; j < d; j++) axisNorm += axis[j] * axis[j];
    axisNorm = Math.sqrt(axisNorm);
    if (axisNorm < 1e-8) break;
    for (let j = 0; j < d; j++) axis[j] /= axisNorm;
    axes.push(axis);
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < n; k++) {
        gram[i][k] -= value * vector[i] * vector[k];
      }
    }
  }

  return { mean, axes };
}

function project(vector: number[], model: PcaModel): Vec3 {
  const coords: Vec3 = [0, 0, 0];
  for (let axisIndex = 0; axisIndex < model.axes.length; axisIndex++) {
    const axis = model.axes[axisIndex];
    let score = 0;
    for (let j = 0; j < axis.length; j++) {
      score += (vector[j] - model.mean[j]) * axis[j];
    }
    coords[axisIndex] = score;
  }
  return coords;
}

function scaleCoords(points: Vec3[], extras: Vec3[], includeExtras: boolean): void {
  let max = 1e-8;
  const considered = includeExtras ? points.concat(extras) : points;
  for (const point of considered) {
    const radius = Math.hypot(point[0], point[1], point[2]);
    if (radius > max) max = radius;
  }
  const scale = 1 / max;
  for (const point of points) {
    point[0] *= scale;
    point[1] *= scale;
    point[2] *= scale;
  }
  for (const point of extras) {
    point[0] *= scale;
    point[1] *= scale;
    point[2] *= scale;
  }
}

/** Fit 3D axes on `vectors`, then place any extra vectors in that same space. */
export function viewCoordinates(
  vectors: number[][],
  extras: number[][] = [],
  includeExtrasInFrame = false
): { points: Vec3[]; extras: Vec3[] } {
  if (vectors.length === 0) return { points: [], extras: extras.map(() => [0, 0, 0]) };
  const model = fitPca3(vectors);
  const points = vectors.map((vector) => project(vector, model));
  const extraPoints = extras.map((vector) => project(vector, model));
  scaleCoords(points, extraPoints, includeExtrasInFrame);
  return { points, extras: extraPoints };
}

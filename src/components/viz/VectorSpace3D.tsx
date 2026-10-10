import { useEffect, useMemo, useRef, useState } from "react";
import type { ChunkEmbedding, RetrievalHit, TextChunk } from "../../types/rag";
import { viewCoordinates } from "../../utils/vectorSpace";

const CHUNK_COLORS = ["#0284c7", "#059669", "#d97706", "#7c3aed", "#e11d48", "#0891b2"];

export type SpacePoint = {
  key: string;
  label: string;
  detail?: string;
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
};

type Props = {
  title: string;
  caption: string;
  points: SpacePoint[];
};

type Camera = { yaw: number; pitch: number; zoom: number };
type Projected = SpacePoint & { sx: number; sy: number; depth: number };

function projectPoint(
  point: SpacePoint,
  camera: Camera,
  width: number,
  height: number
): Projected {
  const cosYaw = Math.cos(camera.yaw);
  const sinYaw = Math.sin(camera.yaw);
  const cosPitch = Math.cos(camera.pitch);
  const sinPitch = Math.sin(camera.pitch);
  const x1 = point.x * cosYaw + point.z * sinYaw;
  const z1 = -point.x * sinYaw + point.z * cosYaw;
  const y1 = point.y * cosPitch - z1 * sinPitch;
  const z2 = point.y * sinPitch + z1 * cosPitch;
  const depth = z2 + 3.2 / camera.zoom;
  const perspective = 280 / Math.max(0.35, depth);
  return {
    ...point,
    sx: width / 2 + x1 * perspective,
    sy: height / 2 - y1 * perspective,
    depth,
  };
}

function drawSpace(
  canvas: HTMLCanvasElement,
  wrap: HTMLDivElement,
  points: SpacePoint[],
  camera: Camera,
  projected: Projected[]
) {
  const width = wrap.clientWidth || 640;
  const height = 380;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);

  const origin = projectPoint(
    { key: "o", label: "", x: 0, y: 0, z: 0, color: "#fff", size: 0 },
    camera,
    width,
    height
  );
  const axisEnd = (x: number, y: number, z: number) =>
    projectPoint(
      { key: "a", label: "", x, y, z, color: "#fff", size: 0 },
      camera,
      width,
      height
    );
  const axes = [
    { end: axisEnd(1.15, 0, 0), color: "#f87171", name: "1" },
    { end: axisEnd(0, 1.15, 0), color: "#4ade80", name: "2" },
    { end: axisEnd(0, 0, 1.15), color: "#60a5fa", name: "3" },
  ];
  ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
  for (const axis of axes) {
    ctx.strokeStyle = axis.color;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(origin.sx, origin.sy);
    ctx.lineTo(axis.end.sx, axis.end.sy);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = axis.color;
    ctx.fillText(axis.name, axis.end.sx + 4, axis.end.sy - 4);
  }

  projected.length = 0;
  for (const point of points) projected.push(projectPoint(point, camera, width, height));
  projected.sort((a, b) => {
    if (a.key === "query") return 1;
    if (b.key === "query") return -1;
    return b.depth - a.depth;
  });

  const labelBoxes: { x: number; y: number; w: number; h: number }[] = [];
  ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
  for (const point of projected) {
    ctx.beginPath();
    ctx.fillStyle = point.color;
    ctx.globalAlpha = point.size < 4.5 ? 0.4 : 1;
    ctx.arc(point.sx, point.sy, point.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (point.size >= 6) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#f8fafc";
      ctx.stroke();
      const widthOfLabel = ctx.measureText(point.label).width;
      let labelX = point.sx + point.size + 4;
      let labelY = point.key === "query" ? point.sy - point.size - 2 : point.sy + 4;
      for (let attempt = 0; attempt < 8; attempt++) {
        const box = { x: labelX, y: labelY - 11, w: widthOfLabel, h: 14 };
        const overlaps = labelBoxes.some(
          (placed) =>
            labelX < placed.x + placed.w + 4 &&
            labelX + widthOfLabel + 4 > placed.x &&
            labelY - 11 < placed.y + placed.h &&
            labelY + 3 > placed.y
        );
        if (!overlaps) {
          labelBoxes.push(box);
          break;
        }
        labelY += 14;
      }
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(point.label, labelX, labelY);
    }
  }
}

export function VectorSpace3D({ title, caption, points }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const camera = useRef<Camera>({ yaw: 0.7, pitch: 0.45, zoom: 1 });
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const projected = useRef<Projected[]>([]);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const [hover, setHover] = useState<SpacePoint | null>(null);

  const redraw = () => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    drawSpace(canvas, wrap, pointsRef.current, camera.current, projected.current);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const paint = () => {
      drawSpace(canvas, wrap, pointsRef.current, camera.current, projected.current);
    };

    const hitTest = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      let best: Projected | null = null;
      let bestDist = 16;
      for (const point of projected.current) {
        const dist = Math.hypot(point.sx - x, point.sy - y);
        if (dist < bestDist) {
          best = point;
          bestDist = dist;
        }
      }
      setHover(
        best
          ? {
              key: best.key,
              label: best.label,
              detail: best.detail,
              x: best.x,
              y: best.y,
              z: best.z,
              color: best.color,
              size: best.size,
            }
          : null
      );
    };

    const onPointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      drag.current = {
        x: event.clientX,
        y: event.clientY,
        yaw: camera.current.yaw,
        pitch: camera.current.pitch,
      };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag.current) {
        hitTest(event.clientX, event.clientY);
        return;
      }
      camera.current.yaw = drag.current.yaw + (event.clientX - drag.current.x) * 0.008;
      camera.current.pitch = Math.max(
        -1.2,
        Math.min(1.2, drag.current.pitch + (event.clientY - drag.current.y) * 0.008)
      );
      paint();
    };
    const onPointerUp = () => {
      drag.current = null;
    };
    const onPointerLeave = () => {
      drag.current = null;
      setHover(null);
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const next = camera.current.zoom * (event.deltaY > 0 ? 0.92 : 1.08);
      camera.current.zoom = Math.max(0.45, Math.min(2.6, next));
      paint();
    };
    const observer = new ResizeObserver(paint);

    paint();
    observer.observe(wrap);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    redraw();
  }, [points]);

  return (
    <figure className="mt-4">
      <figcaption className="mb-2">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-600">{caption}</p>
      </figcaption>
      <div ref={wrapRef} className="overflow-hidden rounded-lg border border-slate-800">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none cursor-grab active:cursor-grabbing"
          role="img"
          aria-label={title}
        />
      </div>
      <p className="mt-2 min-h-10 text-xs text-slate-600" aria-live="polite">
        {hover
          ? `${hover.label}${hover.detail ? ` — ${hover.detail}` : ""}`
          : "Drag to rotate, scroll to zoom, and hover a point. Axes 1–3 are the three main directions of variation, not the original 384 numbers."}
      </p>
    </figure>
  );
}

function snippet(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 140 ? `${flat.slice(0, 140)}…` : flat;
}

export function ChunkVectorSpace({
  embeddings,
  chunks,
}: {
  embeddings: ChunkEmbedding[];
  chunks: TextChunk[];
}) {
  const points = useMemo(() => {
    const chunkById = new Map(chunks.map((chunk) => [chunk.id, chunk]));
    const ordered = embeddings.filter((embedding) => chunkById.has(embedding.chunkId));
    const coords = viewCoordinates(ordered.map((embedding) => embedding.vector)).points;
    return ordered.map((embedding, index) => {
      const chunk = chunkById.get(embedding.chunkId)!;
      return {
        key: embedding.chunkId,
        label: `#${chunk.index}`,
        detail: snippet(chunk.text),
        x: coords[index][0],
        y: coords[index][1],
        z: coords[index][2],
        color: CHUNK_COLORS[chunk.index % CHUNK_COLORS.length],
        size: ordered.length > 24 ? 5 : 6.5,
      };
    });
  }, [chunks, embeddings]);

  return (
    <VectorSpace3D
      title="Chunk vectors in 3D"
      caption="Each dot is one chunk. Nearby dots have more similar embeddings. The original vectors have 384 numbers; this view keeps the three directions that separate the chunks the most."
      points={points}
    />
  );
}

export function RetrievalVectorSpace({
  embeddings,
  chunks,
  hits,
  queryVector,
}: {
  embeddings: ChunkEmbedding[];
  chunks: TextChunk[];
  hits: RetrievalHit[];
  queryVector: number[];
}) {
  const points = useMemo(() => {
    const chunkById = new Map(chunks.map((chunk) => [chunk.id, chunk]));
    const ordered = embeddings.filter((embedding) => chunkById.has(embedding.chunkId));
    const { points: coords, extras } = viewCoordinates(
      ordered.map((embedding) => embedding.vector),
      [queryVector],
      true
    );
    const rankById = new Map(hits.map((hit, rank) => [hit.chunk.id, rank]));
    const plotted: SpacePoint[] = ordered.map((embedding, index) => {
      const chunk = chunkById.get(embedding.chunkId)!;
      const rank = rankById.get(chunk.id);
      const similar = rank !== undefined;
      return {
        key: embedding.chunkId,
        label: similar ? `#${chunk.index} · rank ${rank + 1}` : `#${chunk.index}`,
        detail: snippet(chunk.text),
        x: coords[index][0],
        y: coords[index][1],
        z: coords[index][2],
        color: similar ? CHUNK_COLORS[rank % CHUNK_COLORS.length] : "#94a3b8",
        size: similar ? 7 : 3.5,
      };
    });
    const query = extras[0] ?? [0, 0, 0];
    plotted.push({
      key: "query",
      label: "Query",
      detail: "Your question, embedded with the same model",
      x: query[0],
      y: query[1],
      z: query[2],
      color: "#c4b5fd",
      size: 8,
    });
    return plotted;
  }, [chunks, embeddings, hits, queryVector]);

  return (
    <VectorSpace3D
      title="Query and similar chunks"
      caption="The pale dot is your question. Bright dots are the similar chunks returned for this search. Gray dots are the other chunks. Closer dots are more alike in the reduced space."
      points={points}
    />
  );
}

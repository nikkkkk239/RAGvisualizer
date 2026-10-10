# RAG Visualizer

A **local-first** learning app for Retrieval-Augmented Generation (RAG). Walk through **Upload → Chunk → Embed → Retrieve** entirely in the browser.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (LTS recommended)
- npm 10+ (comes with Node)
- A modern browser with **WebAssembly** (Chrome, Firefox, Safari, Edge)

## Setup

```bash
cd RAGvisualizer
npm install
npm run dev
```

Open the URL Vite prints (usually [http://localhost:5173](http://localhost:5173)).

On first visit, the app **preloads** the embedding model (`Xenova/all-MiniLM-L6-v2`). Model IDs live in `src/config/models.ts`. Downloads are cached by the browser for later visits.

### Other scripts

| Command         | Description              |
|----------------|--------------------------|
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint`  | Run ESLint on the project |

## Using the app

1. **Upload** — Add up to **5** files (`.txt`, `.md`, or text-based `.pdf`). Each file ≤ **2 MB**, combined ≤ **5 MB**. Parsing runs in the browser via [PDF.js](https://mozilla.github.io/pdf.js/).
2. **Chunk** — Tune **chunk size**, **overlap**, and **split method** (fixed / paragraph / sentence). The boundary map and highlighted preview update live.
3. **Embed** — Vectorize chunks with the preloaded embedding model; vectors are saved to **IndexedDB**.
4. **Retrieve** — Type a query, embed it, and rank chunks with **cosine similarity**, **top K**, and a **similarity threshold**. Edit the query and search again to see how the similar chunks change.

Use the stepper at the top to jump between stages. **Reset pipeline** clears document state (models stay loaded in the tab).

Upload limits: `src/config/uploadLimits.ts`. Model preload: `src/services/models/preloadModels.ts`.

## Project structure

```
src/
  components/
    layout/          # App chrome + model bootstrap screen
    pipeline/        # Stepper + step router
    steps/           # One panel per pipeline stage
    ui/              # Shared buttons, panels, badges
  context/           # Pipeline state + model preload
  services/
    ingest/          # Text + PDF parsing
    chunking/        # Chunk strategies
    embedding/       # Browser embeddings
    retrieval/       # Cosine search
    models/          # Transformers.js env + preload
  storage/           # IndexedDB for vectors
  types/
```

## Tech stack

- React 19 + TypeScript + Vite + Tailwind CSS
- [@huggingface/transformers](https://huggingface.co/docs/transformers.js) for embeddings
- PDF.js for PDF text extraction

## License

MIT (add a LICENSE file if you publish the repo).

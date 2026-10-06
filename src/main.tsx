import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ModelPreloadProvider } from "./context/ModelPreloadContext";
import { RagPipelineProvider } from "./context/RagPipelineContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModelPreloadProvider>
      <RagPipelineProvider>
        <App />
      </RagPipelineProvider>
    </ModelPreloadProvider>
  </StrictMode>
);

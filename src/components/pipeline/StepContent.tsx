import type { ComponentType } from "react";
import type { PipelineStepId } from "../../types/rag";
import { UploadStep } from "../steps/UploadStep";
import { ChunkStep } from "../steps/ChunkStep";
import { EmbedStep } from "../steps/EmbedStep";
import { RetrieveStep } from "../steps/RetrieveStep";
import { AnswerStep } from "../steps/AnswerStep";

const STEP_COMPONENTS: Record<PipelineStepId, ComponentType> = {
  upload: UploadStep,
  chunk: ChunkStep,
  embed: EmbedStep,
  retrieve: RetrieveStep,
  answer: AnswerStep,
};

export function StepContent({ stepId }: { stepId: PipelineStepId }) {
  const Component = STEP_COMPONENTS[stepId];
  return <Component />;
}

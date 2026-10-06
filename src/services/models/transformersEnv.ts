export async function loadTransformers() {
  const lib = await import("@huggingface/transformers");
  lib.env.useBrowserCache = true;
  lib.env.allowLocalModels = false;
  return lib;
}

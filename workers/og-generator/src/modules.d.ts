declare module "*.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}

declare module "*.ttf" {
  const fontData: ArrayBuffer;
  export default fontData;
}

declare module "*.png" {
  const imageData: ArrayBuffer;
  export default imageData;
}

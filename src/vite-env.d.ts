/// <reference types="vite/client" />

declare global {
  interface Window {
    midasBridge: {
      request: (
        input: import("./shared/midas").RequestInput
      ) => Promise<import("./shared/midas").RequestResult>;
    };
  }
}

export {};

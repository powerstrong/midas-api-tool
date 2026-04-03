/// <reference types="vite/client" />

declare global {
  interface Window {
    midasBridge: {
      request: (
        input: import("./shared/midas").RequestInput
      ) => Promise<import("./shared/midas").RequestResult>;
      loadSettings: () => Promise<import("./shared/midas").AppSettings>;
      updateSettings: (
        patch: import("./shared/midas").AppSettingsPatch
      ) => Promise<import("./shared/midas").AppSettings>;
      chooseSchemaFolder: () => Promise<import("./shared/midas").FolderSelectionResult>;
      openSchemaFolder: () => Promise<string>;
    };
  }
}

export {};

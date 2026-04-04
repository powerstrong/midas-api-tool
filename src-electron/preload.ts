import { contextBridge, ipcRenderer } from "electron";
import { AppSettings, AppSettingsPatch, FolderSelectionResult, RequestInput, RequestResult } from "../src/shared/midas";

contextBridge.exposeInMainWorld("midasBridge", {
  request(input: RequestInput): Promise<RequestResult> {
    return ipcRenderer.invoke("midas:request", input);
  },
  loadSettings(): Promise<AppSettings> {
    return ipcRenderer.invoke("midas:load-settings");
  },
  updateSettings(patch: AppSettingsPatch): Promise<AppSettings> {
    return ipcRenderer.invoke("midas:update-settings", patch);
  },
  chooseSchemaFolder(): Promise<FolderSelectionResult> {
    return ipcRenderer.invoke("midas:choose-schema-folder");
  },
  openSchemaFolder(): Promise<string> {
    return ipcRenderer.invoke("midas:open-schema-folder");
  },
  openExternal(url: string): Promise<string> {
    return ipcRenderer.invoke("midas:open-external", url);
  },
});



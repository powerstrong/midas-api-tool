import { contextBridge, ipcRenderer } from "electron";
import { RequestInput, RequestResult } from "../src/shared/midas";

contextBridge.exposeInMainWorld("midasBridge", {
  request(input: RequestInput): Promise<RequestResult> {
    return ipcRenderer.invoke("midas:request", input);
  }
});


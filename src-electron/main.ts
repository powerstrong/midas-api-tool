import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import axios from "axios";
import { DB_BY_ENDPOINT, RequestInput, RequestResult } from "../src/shared/midas";

const isDev = !app.isPackaged;

const sanitizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const isAllowedUrl = (baseUrl: string, requestUrl: string) => {
  try {
    const base = new URL(baseUrl);
    const target = new URL(requestUrl);
    return base.origin === target.origin;
  } catch {
    return false;
  }
};

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1600,
    height: 980,
    minWidth: 1280,
    minHeight: 820,
    backgroundColor: "#0d1320",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (isDev) {
    await win.loadURL("http://localhost:5173");
  } else {
    await win.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
};

ipcMain.handle("midas:request", async (_event, input: RequestInput): Promise<RequestResult> => {
  const baseUrl = sanitizeBaseUrl(input.baseUrl);
  const apiKey = input.apiKey.trim();
  const definition = DB_BY_ENDPOINT[input.endpoint];

  if (!baseUrl) {
    return { ok: false, message: "Base URL을 입력하세요." };
  }

  if (!apiKey) {
    return { ok: false, message: "MAPI-Key를 입력하세요." };
  }

  let targetUrl: string;

  try {
    targetUrl = new URL(definition.path, `${baseUrl}/`).toString();
  } catch {
    return { ok: false, message: "Base URL 형식이 올바르지 않습니다." };
  }

  if (!isAllowedUrl(baseUrl, targetUrl)) {
    return { ok: false, message: "허용되지 않은 요청 주소입니다." };
  }

  try {
    const response = await axios.request({
      url: targetUrl,
      method: input.method,
      headers: {
        "Content-Type": "application/json",
        "MAPI-Key": apiKey
      },
      data: input.body,
      timeout: 20000,
      validateStatus: () => true
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        ok: true,
        status: response.status,
        data: response.data
      };
    }

    return {
      ok: false,
      status: response.status,
      message: `요청이 실패했습니다. (${response.status})`,
      details: response.data
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        message: error.message || "네트워크 요청 중 오류가 발생했습니다.",
        status: error.response?.status,
        details: error.response?.data
      };
    }

    return {
      ok: false,
      message: "알 수 없는 오류가 발생했습니다."
    };
  }
});

app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

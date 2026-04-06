import { app, BrowserWindow, dialog, ipcMain, shell, Menu } from "electron";
import path from "node:path";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import axios from "axios";
import {
  AppSettings,
  AppSettingsPatch,
  DB_BY_ENDPOINT,
  DbEndpointId,
  FolderSelectionResult,
  RequestInput,
  RequestResult
} from "../src/shared/midas";
import { createSchemaExportData, createSchemaMarkdown } from "../src/shared/schema-docs";

const isDev = !app.isPackaged;
const settingsFilePath = path.join(app.getPath("userData"), "settings.json");

const defaultSettings = (): AppSettings => ({
  baseUrl: "",
  apiKey: "",
  schemaFolderPath: "",
  panelState: {
    sidebarOpen: true,
    settingsOpen: true,
    alertOpen: true
  },
  recentEndpoints: []
});

const sanitizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

const sanitizeRecentEndpoints = (value: unknown): DbEndpointId[] => {
  const validEndpoints: DbEndpointId[] = ["FBLA", "STLD", "CNLD", "NODE"];
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is DbEndpointId => validEndpoints.includes(item as DbEndpointId));
};

const isAllowedUrl = (baseUrl: string, requestUrl: string) => {
  try {
    const base = new URL(baseUrl);
    const target = new URL(requestUrl);
    return base.origin === target.origin;
  } catch {
    return false;
  }
};

const readSettings = async (): Promise<AppSettings> => {
  try {
    const raw = await readFile(settingsFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      baseUrl: parsed.baseUrl ?? "",
      apiKey: parsed.apiKey ?? "",
      schemaFolderPath: parsed.schemaFolderPath ?? "",
      panelState: {
        ...defaultSettings().panelState,
        ...(parsed.panelState ?? {})
      },
      recentEndpoints: sanitizeRecentEndpoints(parsed.recentEndpoints)
    };
  } catch {
    return defaultSettings();
  }
};

const writeSettings = async (patch: AppSettingsPatch) => {
  const current = await readSettings();
  const next: AppSettings = {
    ...current,
    ...patch,
    panelState: {
      ...current.panelState,
      ...(patch.panelState ?? {})
    },
    recentEndpoints:
      patch.recentEndpoints !== undefined
        ? sanitizeRecentEndpoints(patch.recentEndpoints)
        : current.recentEndpoints
  };

  await mkdir(path.dirname(settingsFilePath), { recursive: true });
  await writeFile(settingsFilePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
};

const exportSchemaFiles = async (schemaFolderPath: string) => {
  if (!schemaFolderPath) {
    return;
  }

  await mkdir(schemaFolderPath, { recursive: true });

  await Promise.all([
    writeFile(
      path.join(schemaFolderPath, "db-schema.json"),
      `${JSON.stringify(createSchemaExportData(), null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      path.join(schemaFolderPath, "db-schema-ko.md"),
      `${createSchemaMarkdown()}\n`,
      "utf8"
    )
  ]);
};

const schemaJsonPath = (folderPath: string) => path.join(folderPath, "db-schema.json");

const ensureSchemaFilesIfNeeded = async (folderPath: string) => {
  if (!folderPath) {
    return { created: false };
  }

  await mkdir(folderPath, { recursive: true });

  try {
    await access(schemaJsonPath(folderPath));
    return { created: false };
  } catch {
    await exportSchemaFiles(folderPath);
    return { created: true };
  }
};


const createWindow = async () => {
  const appIconPath = path.join(app.getAppPath(), "public", "app-icon.png");
  const win = new BrowserWindow({
    width: 1600,
    height: 980,
    minWidth: 1280,
    minHeight: 820,
    backgroundColor: "#0d1320",
    icon: appIconPath,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.removeMenu();
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      void shell.openExternal(url);
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

ipcMain.handle("midas:load-settings", async () => readSettings());

ipcMain.handle("midas:update-settings", async (_event, patch: AppSettingsPatch) => {
  const next = await writeSettings(patch);
  if (patch.schemaFolderPath !== undefined && next.schemaFolderPath) {
    await ensureSchemaFilesIfNeeded(next.schemaFolderPath);
  }
  return next;
});

ipcMain.handle("midas:choose-schema-folder", async (): Promise<FolderSelectionResult> => {
  const current = await readSettings();
  const result = await dialog.showOpenDialog({
    title: "스키마 저장 폴더 선택",
    defaultPath: current.schemaFolderPath || app.getPath("documents"),
    properties: ["openDirectory", "createDirectory"]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { settings: current };
  }

  const folderPath = result.filePaths[0];
  const next = await writeSettings({ schemaFolderPath: folderPath });
  const schemaResult = await ensureSchemaFilesIfNeeded(next.schemaFolderPath);

  if (schemaResult.created) {
    return {
      settings: next,
      message: "스키마 파일이 없어 기본 파일을 생성했습니다."
    };
  }

  return { settings: next };
});

ipcMain.handle("midas:open-external", async (_event, url: string) => {
  return shell.openExternal(url);
});
ipcMain.handle("midas:open-schema-folder", async () => {
  const current = await readSettings();
  if (!current.schemaFolderPath) {
    return "";
  }

  await mkdir(current.schemaFolderPath, { recursive: true });
  await ensureSchemaFilesIfNeeded(current.schemaFolderPath);
  return shell.openPath(current.schemaFolderPath);
});

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
  Menu.setApplicationMenu(null);
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





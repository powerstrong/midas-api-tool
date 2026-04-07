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

const buildDeletePath = (pathName: string, ids?: number[]) => {
  if (!ids || ids.length === 0) {
    return pathName;
  }

  return `${pathName}/${ids.join(",")}`;
};

const sanitizeRecentEndpoints = (value: unknown): DbEndpointId[] => {
  const validEndpoints: DbEndpointId[] = [
    "FBLA",
    "STLD",
    "CNLD",
    "NODE",
    "ELEM",
    "BODF",
    "BMLD",
    "SDSP",
    "NMAS",
    "LTOM",
    "NBOF",
    "PSLT",
    "PRES",
    "PNLD",
    "PNLA",
    "FBLD",
    "FMLD",
    "POSP",
    "EPST",
    "EPSE",
    "POSL"
  ];

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
    writeFile(path.join(schemaFolderPath, "db-schema-ko.md"), `${createSchemaMarkdown()}\n`, "utf8")
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
    title: "\uC2A4\uD0A4\uB9C8 \uC800\uC7A5 \uD3F4\uB354 \uC120\uD0DD",
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
      message: "\uC2A4\uD0A4\uB9C8 \uD30C\uC77C\uC774 \uC5C6\uC5B4 \uAE30\uBCF8 \uD30C\uC77C\uC744 \uC0DD\uC131\uD588\uC2B5\uB2C8\uB2E4."
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
    return { ok: false, message: "Base URL\uC744 \uC785\uB825\uD558\uC138\uC694." };
  }

  if (!apiKey) {
    return { ok: false, message: "MAPI-Key\uB97C \uC785\uB825\uD558\uC138\uC694." };
  }

  if (input.method === "DELETE" && (!input.ids || input.ids.length === 0)) {
    return { ok: false, message: "\uC0AD\uC81C\uD560 ID\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." };
  }

  let targetUrl: string;

  try {
    const requestPath = input.method === "DELETE" ? buildDeletePath(definition.path, input.ids) : definition.path;
    targetUrl = new URL(requestPath, `${baseUrl}/`).toString();
  } catch {
    return { ok: false, message: "Base URL\uC744 \uC785\uB825\uD558\uC138\uC694." };
  }

  if (!isAllowedUrl(baseUrl, targetUrl)) {
    return { ok: false, message: "\uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC740 \uC694\uCCAD \uC8FC\uC18C\uC785\uB2C8\uB2E4." };
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
      message: `\uC694\uCCAD\uC774 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. (${response.status})`,
      details: response.data
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        message: error.message || "\uB124\uD2B8\uC6CC\uD06C \uC694\uCCAD \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
        status: error.response?.status,
        details: error.response?.data
      };
    }

    return {
      ok: false,
      message: "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
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

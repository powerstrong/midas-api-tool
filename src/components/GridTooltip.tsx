import type { ITooltipParams } from "ag-grid-community";

const normalizeText = (value: unknown) => {
  return typeof value === "string" ? value.trim() : "";
};

const parseTooltipContent = (params: ITooltipParams) => {
  const rawText = normalizeText(params.value);
  const fallbackTitle = normalizeText(params.colDef?.headerName);
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    return {
      title: lines[0],
      description: lines.slice(1).join("\n")
    };
  }

  return {
    title: fallbackTitle,
    description: lines[0] ?? ""
  };
};

const GridTooltip = (params: ITooltipParams) => {
  const { title, description } = parseTooltipContent(params);
  const apiField = typeof params.colDef?.field === "string" ? params.colDef.field : "";

  return (
    <div className="grid-tooltip">
      <div className="grid-tooltip-header">
        <span className="grid-tooltip-title">{title}</span>
        {apiField ? <span className="grid-tooltip-code">{apiField}</span> : null}
      </div>
      {description ? <div className="grid-tooltip-body">{description}</div> : null}
    </div>
  );
};

export default GridTooltip;
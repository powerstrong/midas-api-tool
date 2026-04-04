import { useEffect, useRef, useState } from "react";
import type { RowIssue } from "../../shared/midas";

interface ResultMessage {
  tone: "neutral" | "success" | "error";
  text: string;
}

interface WorkResultPanelProps {
  isOpen: boolean;
  messagePulse: boolean;
  resultMessage?: ResultMessage;
  issues: RowIssue[];
  onToggle: () => void;
}

type ResultTab = "alerts" | "issues";

export const WorkResultPanel = ({
  isOpen,
  messagePulse,
  resultMessage,
  issues,
  onToggle
}: WorkResultPanelProps) => {
  const [activeTab, setActiveTab] = useState<ResultTab>("alerts");
  const [flashingTab, setFlashingTab] = useState<ResultTab | null>(null);
  const previousAlertTextRef = useRef<string | undefined>(undefined);
  const previousIssueCountRef = useRef(issues.length);

  useEffect(() => {
    if (!resultMessage?.text) {
      previousAlertTextRef.current = undefined;
      return;
    }

    if (previousAlertTextRef.current && previousAlertTextRef.current !== resultMessage.text) {
      setFlashingTab("alerts");
      const timeoutId = window.setTimeout(() => setFlashingTab((current) => (current === "alerts" ? null : current)), 1400);
      return () => window.clearTimeout(timeoutId);
    }

    previousAlertTextRef.current = resultMessage.text;
    return;
  }, [resultMessage]);

  useEffect(() => {
    if (issues.length > previousIssueCountRef.current) {
      setFlashingTab("issues");
      const timeoutId = window.setTimeout(() => setFlashingTab((current) => (current === "issues" ? null : current)), 1400);
      previousIssueCountRef.current = issues.length;
      return () => window.clearTimeout(timeoutId);
    }

    previousIssueCountRef.current = issues.length;
    return;
  }, [issues.length]);

  const alertCount = resultMessage ? 1 : 0;
  const issueCount = issues.length;

  return (
    <section className={`collapsible card ${messagePulse ? "message-pulse" : ""}`}>
      <div className="section-header">
        <div>
          <h2>작업 결과</h2>
          <p>연결, 스키마 안내, 검증 상태, 실행 결과를 한 곳에서 확인합니다.</p>
        </div>
        <button type="button" className="ghost-button" onClick={onToggle}>
          {isOpen ? "접기" : "열기"}
        </button>
      </div>
      {isOpen ? (
        <div className="section-body work-result-panel">
          <div className="result-tabs" role="tablist" aria-label="작업 결과 탭">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "alerts"}
              className={`result-tab ${activeTab === "alerts" ? "active" : ""} ${flashingTab === "alerts" ? "tab-flash" : ""}`.trim()}
              onClick={() => setActiveTab("alerts")}
            >
              <span>알림</span>
              {alertCount > 0 ? <span className="result-tab-badge">{alertCount}</span> : null}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "issues"}
              className={`result-tab ${activeTab === "issues" ? "active" : ""} ${flashingTab === "issues" ? "tab-flash" : ""}`.trim()}
              onClick={() => setActiveTab("issues")}
            >
              <span>검증 결과</span>
              {issueCount > 0 ? <span className="result-tab-badge">{issueCount}</span> : null}
            </button>
          </div>

          {activeTab === "alerts" ? (
            <section className="result-section" role="tabpanel">
              {resultMessage ? (
                <div className={`top-banner tone-${resultMessage.tone}`}>{resultMessage.text}</div>
              ) : (
                <div className="empty-state">표시할 작업 알림이 없습니다.</div>
              )}
            </section>
          ) : (
            <section className="result-section" role="tabpanel">
              <div className="issue-list">
                {issues.length === 0 ? (
                  <div className="empty-state">현재 입력값에 형식 오류가 없습니다.</div>
                ) : (
                  issues.map((issue) => (
                    <div key={issue.rowId} className="issue-item">
                      <strong>{issue.rowId}</strong>
                      <span>
                        {issue.cells.map((cell) => `${cell.fieldKey}: ${cell.message}`).join(" / ")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </section>
  );
};

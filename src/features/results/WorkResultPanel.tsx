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

export const WorkResultPanel = ({
  isOpen,
  messagePulse,
  resultMessage,
  issues,
  onToggle
}: WorkResultPanelProps) => {
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
          <div className="result-stack">
            <section className="result-section">
              <h3 className="result-section-title">알림</h3>
              {resultMessage ? (
                <div className={`top-banner tone-${resultMessage.tone}`}>{resultMessage.text}</div>
              ) : (
                <div className="empty-state">표시할 작업 알림이 없습니다.</div>
              )}
            </section>

            <section className="result-section">
              <h3 className="result-section-title">검증 결과</h3>
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
          </div>
        </div>
      ) : null}
    </section>
  );
};

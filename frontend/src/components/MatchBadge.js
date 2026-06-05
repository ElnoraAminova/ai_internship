export function MatchBadge({ score }) {
  const cls = score >= 70 ? 'match-high' : score >= 40 ? 'match-medium' : 'match-low';
  return <span className={`match-badge ${cls}`}>⚡ {score}% Match</span>;
}

export function ScoreBar({ score }) {
  const cls = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-label">
        <span>Match Score</span>
        <span>{score}%</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${score}%` }} data-class={cls} />
      </div>
    </div>
  );
}

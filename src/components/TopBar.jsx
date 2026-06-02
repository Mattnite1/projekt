import './TopBar.css';

function TopBar({ onStartCause }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">Licytuj dla piesków</span>
        <span className="topbar-live-badge">
          <span className="topbar-live-dot"></span>
          Live Now
        </span>
      </div>
      <div className="topbar-right">
        <button className="topbar-cta" onClick={onStartCause}>
          Start a Cause
        </button>
      </div>
    </header>
  );
}

export default TopBar;

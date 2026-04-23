export default function TweaksPanel({ density, cellMin, orderMode, groups, onDensity, onCellMin, onOrderMode, onClose }) {
  const handleDownload = () => {
    const ts = new Date().toISOString().replace(/:/g, '-').replace(/\.\d+Z$/, 'Z')
    const blob = new Blob([JSON.stringify(groups, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookmarks-${ts}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside className="mc-tweaks">
      <div className="mc-tweaks-head">
        Tweaks
        <button className="mc-x" onClick={onClose}>✕</button>
      </div>
      <div className="mc-tweaks-body">
        <div className="mc-tweaks-row">
          <label>Density</label>
          <div className="mc-seg">
            {['compact','balanced','spacious'].map(d => (
              <button key={d} className={density === d ? 'on' : ''} onClick={() => onDensity(d)}>{d}</button>
            ))}
          </div>
        </div>
        <div className="mc-tweaks-row">
          <label>Card width <span className="mc-tweaks-val">{cellMin}px</span></label>
          <input
            type="range"
            min="240" max="520" step="20"
            value={cellMin}
            onChange={e => onCellMin(Number(e.target.value))}
          />
        </div>
        <div className="mc-tweaks-row">
          <label>Group order</label>
          <div className="mc-seg">
            {[['default','default'],['pinned','pinned first'],['az','A → Z'],['size','by size']].map(([v, lbl]) => (
              <button key={v} className={orderMode === v ? 'on' : ''} onClick={() => onOrderMode(v)}>{lbl}</button>
            ))}
          </div>
          <p className="mc-tweaks-hint" style={{ marginTop: 8 }}>
            Click the ★ in any group header to pin it. Pinned-first bubbles them to the top.
          </p>
        </div>
        <div className="mc-tweaks-row">
          <label>Backup</label>
          <button className="mc-btn-ghost" style={{ width: '100%' }} onClick={handleDownload}>
            ↓ download bookmarks.json
          </button>
        </div>
      </div>
    </aside>
  )
}

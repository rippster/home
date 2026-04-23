import { useState, useEffect, useRef } from 'react'

export default function AskModal({ title, label, message, defaultVal, isConfirm, onOk, onDelete, onClose }) {
  const [val, setVal] = useState(defaultVal || '')
  const [confirming, setConfirming] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setVal(defaultVal || '')
    setConfirming(false)
    setTimeout(() => inputRef.current?.focus(), 30)
  }, [defaultVal])

  const handleOk = () => {
    if (confirming) { onDelete(); return }
    if (isConfirm) { onOk(true); return }
    if (val.trim()) onOk(val.trim())
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') {
      if (confirming) { setConfirming(false); return }
      onClose()
    }
    if (e.key === 'Enter') handleOk()
  }

  const showConfirm = isConfirm || confirming

  return (
    <div className="mc-modal-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="mc-modal" role="dialog" onKeyDown={handleKey}>
        <div className="mc-modal-head">
          <span>{confirming ? 'delete group' : title}</span>
          <button className="mc-x" onClick={onClose}>✕</button>
        </div>
        <div className="mc-modal-body">
          {confirming ? (
            <div style={{ fontSize: 12, color: 'var(--mc-ink-2)', lineHeight: 1.5 }}>
              Delete this group and all its bookmarks? This cannot be undone.
            </div>
          ) : (
            <>
              {message && (
                <div style={{ fontSize: 12, color: 'var(--mc-ink-2)', lineHeight: 1.5 }}>{message}</div>
              )}
              {!isConfirm && (
                <label>
                  {label && <span className="mc-field-label">{label}</span>}
                  <input
                    ref={inputRef}
                    type="text"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    autoComplete="off"
                  />
                </label>
              )}
            </>
          )}
        </div>
        <div className="mc-modal-foot">
          {onDelete && !confirming ? (
            <button className="mc-btn-del" onClick={() => setConfirming(true)}>delete group</button>
          ) : confirming ? (
            <button className="mc-btn-ghost" onClick={() => setConfirming(false)}>back</button>
          ) : (
            <div />
          )}
          <div className="mc-modal-btns">
            <button className="mc-btn-ghost" onClick={onClose}>cancel</button>
            <button
              className={`mc-btn-primary ${showConfirm ? 'danger' : ''}`}
              onClick={handleOk}
            >
              {confirming ? 'delete' : isConfirm ? 'delete' : 'ok'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

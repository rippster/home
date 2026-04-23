import { useState, useEffect } from 'react'
import { themeColor } from '../dashboard-utils'

const THEMES = ['red','orange','green','blue','purple','pink','azureblue','cyan','lightgrey','lightgreen']

const THEME_BG = {
  red: '#d1615c', orange: '#e9b872', green: '#8cb369', blue: '#7aa2c7',
  purple: '#b69cd6', pink: '#d58ba8', azureblue: '#4fa3d1', cyan: '#5fb5b5',
  lightgrey: '#a6a396', lightgreen: '#a8c878',
}

export default function DashEditModal({ isNew, groupName, bookmark, groups, onSave, onDelete, onClose }) {
  const [name, setName] = useState(bookmark?.Name || '')
  const [url, setUrl] = useState(bookmark?.Href || '')
  const [group, setGroup] = useState(groupName)
  const [icon, setIcon] = useState(bookmark?.Icon || '')
  const [theme, setTheme] = useState(bookmark?.Theme || 'blue')

  useEffect(() => {
    setName(bookmark?.Name || '')
    setUrl(bookmark?.Href || '')
    setGroup(groupName)
    setIcon(bookmark?.Icon || '')
    setTheme(bookmark?.Theme || 'blue')
  }, [bookmark, groupName])

  const handleSave = () => {
    if (!name.trim() || !url.trim()) return
    onSave({ name: name.trim(), url: url.trim(), icon: icon.trim(), theme }, group)
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
  }

  return (
    <div className="mc-modal-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="mc-modal" role="dialog" onKeyDown={handleKey}>
        <div className="mc-modal-head">
          <span>{isNew ? 'new bookmark' : 'edit bookmark'}</span>
          <button className="mc-x" onClick={onClose}>✕</button>
        </div>
        <div className="mc-modal-body">
          <label>
            <span className="mc-field-label">name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </label>
          <label>
            <span className="mc-field-label">url</span>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
          </label>
          <label>
            <span className="mc-field-label">icon (FA class)</span>
            <input
              type="text"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              placeholder="e.g. fa-brands fa-confluence"
              autoComplete="off"
            />
          </label>
          <label>
            <span className="mc-field-label">group</span>
            <select value={group} onChange={e => setGroup(e.target.value)}>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>
            <span className="mc-field-label">theme</span>
            <div className="mc-theme-row">
              {THEMES.map(t => (
                <span
                  key={t}
                  className={`mc-swatch ${theme === t ? 'on' : ''}`}
                  style={{ background: THEME_BG[t] }}
                  title={t}
                  onClick={() => setTheme(t)}
                />
              ))}
            </div>
          </label>
        </div>
        <div className="mc-modal-foot">
          {!isNew
            ? <button className="mc-btn-del" onClick={onDelete}>delete</button>
            : <div />
          }
          <div className="mc-modal-btns">
            <button className="mc-btn-ghost" onClick={onClose}>cancel</button>
            <button className="mc-btn-primary" onClick={handleSave}>save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

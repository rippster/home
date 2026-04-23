import { useState, useEffect, useRef } from 'react'
import { hostOf, highlight } from '../dashboard-utils'

function score(b, groupName, q) {
  const name = (b.Name || '').toLowerCase()
  const host = hostOf(b.Href).toLowerCase()
  const group = (groupName || '').toLowerCase()
  const ql = q.toLowerCase()
  let s = 0
  if (name.startsWith(ql)) s += 1000
  if (name.includes(ql)) s += 500
  if (host.includes(ql)) s += 100
  if (group.includes(ql)) s += 50
  return s
}

export default function CommandPalette({ groups, onClose }) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const results = (() => {
    if (!query.trim()) {
      // Show all bookmarks in group order
      const all = []
      groups.forEach(g => g.Bookmarks.forEach(b => all.push({ b, groupName: g.Name })))
      return all.slice(0, 50)
    }
    const q = query.trim()
    const all = []
    groups.forEach(g => g.Bookmarks.forEach(b => {
      const s = score(b, g.Name, q)
      if (s > 0) all.push({ b, groupName: g.Name, s })
    }))
    all.sort((a, z) => z.s - a.s || a.groupName.localeCompare(z.groupName) || (a.b.Name || '').localeCompare(z.b.Name || ''))
    return all.slice(0, 50)
  })()

  useEffect(() => { setActiveIdx(0) }, [query])

  const open = (b, newTab) => {
    if (newTab) window.open(b.Href, '_blank')
    else window.location.href = b.Href
    onClose()
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') {
      const r = results[activeIdx]
      if (r) open(r.b, e.metaKey || e.ctrlKey)
    }
  }

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('.active')
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  return (
    <div className="mc-palette-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="mc-palette" role="dialog" aria-label="Command palette">
        <div className="mc-palette-in">
          <span className="p">›</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="jump to anything…"
            autoComplete="off"
            spellCheck="false"
          />
          <span className="esc">esc</span>
        </div>
        <div className="mc-palette-list" ref={listRef}>
          {results.length === 0 && (
            <div className="mc-palette-empty">no matches for "{query}"</div>
          )}
          {results.map(({ b, groupName }, i) => (
            <div
              key={`${groupName}-${b.Name}-${i}`}
              className={`mc-palette-row ${i === activeIdx ? 'active' : ''}`}
              onClick={() => open(b, false)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className="dot" />
              <span className="nm">
                {query ? highlight(b.Name, query) : b.Name}
              </span>
              <span className="cat">{groupName}</span>
              <span className="ret">↵</span>
            </div>
          ))}
        </div>
        <div className="mc-palette-foot">
          <span><b>↑↓</b> nav</span>
          <span><b>↵</b> open</span>
          <span><b>⌘↵</b> new tab</span>
          <span className="mc-sp" />
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  )
}

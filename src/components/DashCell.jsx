import { useRef, useState } from 'react'
import { themeColor, hostOf, highlight } from '../dashboard-utils'

export default function DashCell({ group, isPinned, filterQuery, onEditBookmark, onAddBookmark, onTogglePin, onRename, onReorder }) {
  const [dropSide, setDropSide] = useState(null) // 'before' | 'after' | null
  const cellRef = useRef(null)

  const handleDragStart = (e) => {
    cellRef.current?.classList.add('mc-drag-src')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', group.Name)
  }

  const handleDragEnd = () => {
    cellRef.current?.classList.remove('mc-drag-src')
    setDropSide(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (e.dataTransfer.getData && cellRef.current) {
      const r = cellRef.current.getBoundingClientRect()
      setDropSide((e.clientX - r.left) > r.width / 2 ? 'after' : 'before')
    }
  }

  const handleDragLeave = (e) => {
    if (!cellRef.current?.contains(e.relatedTarget)) setDropSide(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const side = dropSide
    setDropSide(null)
    const srcName = e.dataTransfer.getData('text/plain')
    if (!srcName || srcName === group.Name) return
    onReorder(srcName, group.Name, side === 'after')
  }

  const handleBookmarkClick = (e, href) => {
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      window.open(href, '_blank')
    } else {
      window.location.href = href
    }
  }

  const dropClass = dropSide === 'before' ? 'mc-drop-before' : dropSide === 'after' ? 'mc-drop-after' : ''

  return (
    <section
      ref={cellRef}
      className={`mc-cell ${isPinned ? 'mc-pinned' : ''} ${dropClass}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mc-cell-head">
        <div className="mc-cell-title">
          <span className="mc-grip" title="Drag to reorder">⋮⋮</span>
          <span
            className={`mc-pin-dot ${isPinned ? '' : 'off'}`}
            title="Pin group"
            onClick={(e) => { e.stopPropagation(); onTogglePin() }}
          >
            {isPinned ? '★' : '☆'}
          </span>
          <span
            title="Click to rename"
            onClick={(e) => { e.stopPropagation(); onRename() }}
            style={{ cursor: 'text' }}
          >
            {group.Name}
          </span>
          <span className="mc-cell-count">[{group.Bookmarks.length}]</span>
        </div>
        <div className="mc-cell-actions">
          <button onClick={(e) => { e.stopPropagation(); onAddBookmark() }}>+ link</button>
        </div>
      </div>

      <ul>
        {group.Bookmarks.map((b, idx) => (
          <li
            key={idx}
            onClick={(e) => {
              if (e.target.closest('button[data-edit]')) return
              handleBookmarkClick(e, b.Href)
            }}
          >
            <span className="mc-bk-idx">{String(idx + 1).padStart(2, '0')}</span>
            <span className="mc-bk-ic">
              {b.Icon
                ? <i className={b.Icon} style={{ color: themeColor(b.Theme) }} aria-hidden="true" />
                : <span className="mc-bk-dot" style={{ background: themeColor(b.Theme) }} />
              }
            </span>
            <span className="mc-bk-name" title={b.Href}>
              {filterQuery ? highlight(b.Name, filterQuery) : b.Name}
            </span>
            <span className="mc-bk-ctrl">
              <button data-edit="true" title="Edit" onClick={(e) => { e.stopPropagation(); onEditBookmark(idx) }}>✎</button>
            </span>
          </li>
        ))}
      </ul>

      <div className="mc-cell-add" onClick={(e) => { e.stopPropagation(); onAddBookmark() }}>
        + add link
      </div>
    </section>
  )
}

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { modelsService } from './services/modelsService'
import { orderedGroups, isValid, hostOf } from './dashboard-utils'
import DashCell from './components/DashCell'
import CommandPalette from './components/CommandPalette'
import DashEditModal from './components/DashEditModal'
import AskModal from './components/AskModal'
import TweaksPanel from './components/TweaksPanel'
import './dashboard.css'

const CLOCK_ZONES = [
  { label: 'UK', tz: 'Europe/London' },
  { label: 'PL', tz: 'Europe/Warsaw' },
  { label: 'NY', tz: 'America/New_York' },
  { label: 'MN', tz: 'America/Chicago' },
  { label: 'LA', tz: 'America/Los_Angeles' },
]

function computeClocks() {
  const now = new Date()
  return CLOCK_ZONES.map(z => {
    const f = new Intl.DateTimeFormat('en-GB', { timeZone: z.tz, hour: '2-digit', minute: '2-digit', hour12: false })
    const time = f.format(now)
    const h = parseInt(time.slice(0, 2), 10)
    return { label: z.label, time, day: h >= 7 && h < 19 }
  })
}

function isInputEl() {
  const el = document.activeElement
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
}

export default function Dashboard() {
  const [groups, setGroups] = useState([])
  const [pins, setPins] = useState(() => new Set(JSON.parse(localStorage.getItem('mc-pins-v1') || '[]')))
  const [orderMode, setOrderMode] = useState(() => localStorage.getItem('mc-order-v1') || 'default')
  const [density, setDensity] = useState(() => localStorage.getItem('mc-density-v1') || 'balanced')
  const [cellMin, setCellMin] = useState(() => parseInt(localStorage.getItem('mc-cell-min-v1') || '320'))
  const [filterQuery, setFilterQuery] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [modalMode, setModalMode] = useState(null)
  const [askMode, setAskMode] = useState(null)
  const [tweaksOpen, setTweaksOpen] = useState(false)
  const [clocks, setClocks] = useState(computeClocks)
  const [toast, setToast] = useState(null)
  const filterRef = useRef(null)
  const toastTimer = useRef(null)

  // Load data
  useEffect(() => {
    modelsService.getModels().then(data => {
      if (Array.isArray(data)) setGroups(data)
    }).catch(console.error)
  }, [])

  // Clocks
  useEffect(() => {
    const id = setInterval(() => setClocks(computeClocks()), 30000)
    return () => clearInterval(id)
  }, [])

  // Body class + CSS vars
  useEffect(() => {
    document.body.classList.add('mc-active')
    return () => document.body.classList.remove('mc-active')
  }, [])
  useEffect(() => { document.body.dataset.density = density }, [density])
  useEffect(() => { document.body.style.setProperty('--cell-min', cellMin + 'px') }, [cellMin])

  // Persist prefs
  useEffect(() => { localStorage.setItem('mc-order-v1', orderMode) }, [orderMode])
  useEffect(() => { localStorage.setItem('mc-density-v1', density) }, [density])
  useEffect(() => { localStorage.setItem('mc-cell-min-v1', String(cellMin)) }, [cellMin])
  useEffect(() => { localStorage.setItem('mc-pins-v1', JSON.stringify([...pins])) }, [pins])

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 1800)
  }, [])

  const saveGroups = useCallback(async (newGroups) => {
    try {
      await modelsService.saveModels(newGroups)
      showToast('saved')
    } catch {
      showToast('save failed')
    }
  }, [showToast])

  function mutateGroups(fn) {
    setGroups(prev => {
      const next = fn(prev)
      saveGroups(next)
      return next
    })
  }

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (paletteOpen) { setPaletteOpen(false); return }
        if (modalMode) { setModalMode(null); return }
        if (askMode) { setAskMode(null); return }
        if (tweaksOpen) { setTweaksOpen(false); return }
        if (filterQuery) { setFilterQuery(''); return }
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setPaletteOpen(true); return
      }
      if (e.key === '/' && !isInputEl()) {
        e.preventDefault(); filterRef.current?.focus(); return
      }
      if (!isInputEl() && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1) {
        setFilterQuery(q => q + e.key)
        filterRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [paletteOpen, modalMode, askMode, tweaksOpen, filterQuery])

  // --- Mutations ---
  const addBookmark = (groupName, data) => {
    mutateGroups(prev => prev.map(g =>
      g.Name !== groupName ? g
        : { ...g, Bookmarks: [...g.Bookmarks.filter(isValid), { Name: data.name, Href: data.url, Icon: data.icon, Theme: data.theme }] }
    ))
  }

  const updateBookmark = (groupName, idx, data, newGroup) => {
    const bk = { Name: data.name, Href: data.url, Icon: data.icon, Theme: data.theme }
    mutateGroups(prev => {
      if (newGroup && newGroup !== groupName) {
        return prev.map(g => {
          if (g.Name === groupName) return { ...g, Bookmarks: g.Bookmarks.filter((_, i) => i !== idx) }
          if (g.Name === newGroup) return { ...g, Bookmarks: [...g.Bookmarks, bk] }
          return g
        })
      }
      return prev.map(g => {
        if (g.Name !== groupName) return g
        const bks = [...g.Bookmarks]
        bks[idx] = bk
        return { ...g, Bookmarks: bks }
      })
    })
  }

  const deleteBookmark = (groupName, idx) => {
    mutateGroups(prev => prev.map(g =>
      g.Name !== groupName ? g : { ...g, Bookmarks: g.Bookmarks.filter((_, i) => i !== idx) }
    ))
  }

  const addGroup = (name) => {
    const t = name.trim()
    if (!t) return
    mutateGroups(prev => [...prev, { Name: t, Bookmarks: [] }])
  }

  const renameGroup = (oldName, newName) => {
    const t = newName.trim()
    if (!t || t === oldName) return
    mutateGroups(prev => prev.map(g => g.Name === oldName ? { ...g, Name: t } : g))
    setPins(prev => {
      if (!prev.has(oldName)) return prev
      const next = new Set(prev)
      next.delete(oldName); next.add(t)
      return next
    })
  }

  const deleteGroup = (name) => {
    mutateGroups(prev => prev.filter(g => g.Name !== name))
    setPins(prev => { const next = new Set(prev); next.delete(name); return next })
    setAskMode(null)
  }

  const reorderGroups = (srcName, dstName, placeAfter) => {
    mutateGroups(prev => {
      const arr = [...prev]
      const si = arr.findIndex(g => g.Name === srcName)
      const [moved] = arr.splice(si, 1)
      const di = arr.findIndex(g => g.Name === dstName)
      arr.splice(placeAfter ? di + 1 : di, 0, moved)
      return arr
    })
    if (orderMode !== 'default') setOrderMode('default')
  }

  const togglePin = (name) => {
    setPins(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  // --- Modal helpers ---
  const openEditNew = (groupName) => setModalMode({ groupName, bookmarkIndex: null, isNew: true })
  const openEditExisting = (groupName, idx) => setModalMode({ groupName, bookmarkIndex: idx, isNew: false })

  const handleModalSave = (data, newGroup) => {
    if (!modalMode) return
    if (modalMode.isNew) addBookmark(newGroup || modalMode.groupName, data)
    else updateBookmark(modalMode.groupName, modalMode.bookmarkIndex, data, newGroup)
    setModalMode(null)
  }

  const handleModalDelete = () => {
    if (!modalMode || modalMode.isNew) return
    setAskMode({
      title: 'delete bookmark',
      message: 'This cannot be undone.',
      isConfirm: true,
      onOk: () => {
        deleteBookmark(modalMode.groupName, modalMode.bookmarkIndex)
        setModalMode(null)
        setAskMode(null)
      }
    })
  }

  // --- Derived state ---
  const ordered = useMemo(() => orderedGroups(groups, orderMode, pins), [groups, orderMode, pins])
  const totalLinks = useMemo(() => ordered.reduce((s, g) => s + g.Bookmarks.length, 0), [ordered])

  const filtered = useMemo(() => {
    if (!filterQuery) return ordered
    const q = filterQuery.toLowerCase()
    return ordered.map(g => ({
      ...g,
      Bookmarks: g.Bookmarks.filter(b =>
        (b.Name || '').toLowerCase().includes(q) ||
        hostOf(b.Href).toLowerCase().includes(q) ||
        g.Name.toLowerCase().includes(q)
      )
    })).filter(g => g.Bookmarks.length > 0)
  }, [ordered, filterQuery])

  const visibleLinks = useMemo(() => filtered.reduce((s, g) => s + g.Bookmarks.length, 0), [filtered])

  const modalBookmark = modalMode && !modalMode.isNew
    ? groups.find(g => g.Name === modalMode.groupName)?.Bookmarks[modalMode.bookmarkIndex]
    : null

  return (
    <div className="mc-root">
      {/* Top bar */}
      <header className="mc-topbar">
        <div className="mc-brand">
          <span className="mc-brand-sq" />
          <span>Home</span>
          <span className="mc-brand-pipe">│</span>
          <span className="mc-brand-sub">{totalLinks} links · {ordered.length} groups</span>
        </div>
        <div className="mc-sp" />
        <div className="mc-clocks">
          {clocks.map(c => (
            <div key={c.label} className={`mc-clock-c ${c.day ? 'day' : 'night'}`}>
              <span className="mc-clock-label">{c.label}</span>
              <span className="mc-clock-t">{c.time}</span>
            </div>
          ))}
        </div>
        <button className="mc-kbd-chip" title="Open command palette (⌘K)" onClick={() => setPaletteOpen(true)}>⌘K</button>
      </header>

      {/* Utility bar */}
      <div className="mc-util">
        <div className={`mc-filter ${filterQuery ? 'has-text' : ''}`}>
          <span className="mc-filter-p">/</span>
          <input
            ref={filterRef}
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="type to filter… (name, host, category)"
            autoComplete="off"
            spellCheck="false"
          />
          {filterQuery && <span className="mc-filter-count">{visibleLinks} match{visibleLinks !== 1 ? 'es' : ''}</span>}
          <span className="mc-filter-clear" onClick={() => setFilterQuery('')}>esc</span>
          <span className="mc-filter-hint">
            <span className="mc-kbd-chip-sm">/</span> focus
          </span>
        </div>
        <div className="mc-idjump">
          <label className="mc-idbox" title="Azure DevOps Work Item">
            <span className="mc-idbox-lbl">WI</span>
            <input type="number" placeholder="12345" min="1"
              onKeyDown={e => e.key === 'Enter' && e.target.value &&
                window.open(`https://dev.azure.com/apprissdevops/missioncontrol/_workitems/edit/${e.target.value}`, '_blank')} />
            <span className="mc-idbox-ret">↵</span>
          </label>
          <label className="mc-idbox" title="Jira RCS">
            <span className="mc-idbox-lbl">RCS</span>
            <input type="number" placeholder="6789" min="1"
              onKeyDown={e => e.key === 'Enter' && e.target.value &&
                window.open(`https://trebuco.atlassian.net/jira/servicedesk/projects/RCS/queues/custom/67/RCS-${e.target.value}`)} />
            <span className="mc-idbox-ret">↵</span>
          </label>
          <label className="mc-idbox" title="Jira ENG">
            <span className="mc-idbox-lbl">ENG</span>
            <input type="number" placeholder="1234" min="1"
              onKeyDown={e => e.key === 'Enter' && e.target.value &&
                window.open(`https://trebuco.atlassian.net/browse/ENG-${e.target.value}`)} />
            <span className="mc-idbox-ret">↵</span>
          </label>
        </div>
      </div>

      {/* Grid */}
      <main className="mc-grid">
        {filtered.map(group => (
          <DashCell
            key={group.Name}
            group={group}
            isPinned={pins.has(group.Name)}
            filterQuery={filterQuery}
            onEditBookmark={idx => openEditExisting(group.Name, idx)}
            onAddBookmark={() => openEditNew(group.Name)}
            onTogglePin={() => togglePin(group.Name)}
            onRename={() => setAskMode({
              title: 'rename group', label: 'new name', defaultVal: group.Name,
              isConfirm: false,
              onOk: val => { renameGroup(group.Name, val); setAskMode(null) },
              onDelete: () => deleteGroup(group.Name)
            })}
            onReorder={reorderGroups}
          />
        ))}
        {!filterQuery && (
          <section className="mc-cell mc-new-group" onClick={() => setAskMode({
            title: 'new group', label: 'group name', defaultVal: '',
            isConfirm: false,
            onOk: val => { addGroup(val); setAskMode(null) }
          })}>
            <span className="mc-new-plus">+</span>
            <span className="mc-new-lbl">new group</span>
            <span className="mc-kbd-chip-sm">click to add</span>
          </section>
        )}
        {filterQuery && filtered.length === 0 && (
          <div className="mc-grid-empty">
            no matches for <span className="mc-mono-hint">"{filterQuery}"</span> · press <span className="mc-kbd-chip-sm">esc</span> to clear
          </div>
        )}
      </main>

      {/* Status bar */}
      <footer className="mc-statusbar">
        <span className="mc-mode">normal</span>
        <span><span className="mc-kbd-sm">/</span> filter</span>
        <span><span className="mc-kbd-sm">⌘K</span> palette</span>
        <span><span className="mc-kbd-sm">esc</span> clear</span>
        <span><span className="mc-kbd-sm">hover</span> edit</span>
        <span className="mc-sp" />
        <span>viewing <b>{filtered.length}</b>/<b>{ordered.length}</b> groups · <b>{visibleLinks}</b>/<b>{totalLinks}</b> links</span>
      </footer>

      <button className="mc-tweaks-toggle" onClick={() => setTweaksOpen(o => !o)} title="Tweaks">⚙</button>

      {paletteOpen && <CommandPalette groups={ordered} onClose={() => setPaletteOpen(false)} />}

      {modalMode && (
        <DashEditModal
          isNew={modalMode.isNew}
          groupName={modalMode.groupName}
          bookmark={modalBookmark}
          groups={groups.map(g => g.Name)}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onClose={() => setModalMode(null)}
        />
      )}

      {askMode && (
        <AskModal
          title={askMode.title}
          label={askMode.label}
          message={askMode.message}
          defaultVal={askMode.defaultVal}
          isConfirm={askMode.isConfirm}
          onOk={askMode.onOk}
          onDelete={askMode.onDelete}
          onClose={() => setAskMode(null)}
        />
      )}

      {tweaksOpen && (
        <TweaksPanel
          density={density}
          cellMin={cellMin}
          orderMode={orderMode}
          groups={groups}
          onDensity={setDensity}
          onCellMin={setCellMin}
          onOrderMode={setOrderMode}
          onClose={() => setTweaksOpen(false)}
        />
      )}

      {toast && <div className={`mc-toast ${toast ? 'show' : ''}`}>{toast}</div>}
    </div>
  )
}

import { createElement, Fragment } from 'react'

export const THEME_COLORS = {
  red: 'var(--mc-bad)', orange: 'var(--mc-warn)', green: 'var(--mc-ok)',
  blue: 'var(--mc-info)', purple: 'var(--mc-violet)', pink: 'var(--mc-pink)',
  azureblue: '#4fa3d1', cyan: '#5fb5b5', lightgrey: '#a6a396', lightgreen: '#a8c878',
}

export function themeColor(t) {
  if (!t) return 'var(--mc-ink-3)'
  if (t.startsWith('#')) return t
  return THEME_COLORS[t.toLowerCase()] || 'var(--mc-ink-3)'
}

export function hostOf(url) {
  try { return new URL(url).host.replace(/^www\./, '') } catch { return '' }
}

export function isValid(b) { return b && b.Name && b.Href }

export function escHtml(s) {
  return (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

export function highlight(text, q) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return text
  return createElement(Fragment, null,
    text.slice(0, i),
    createElement('mark', null, text.slice(i, i + q.length)),
    text.slice(i + q.length)
  )
}

export function orderedGroups(groups, orderMode, pins) {
  const valid = groups
    .filter(g => g && g.Name && Array.isArray(g.Bookmarks))
    .map(g => ({ ...g, Bookmarks: g.Bookmarks.filter(isValid) }))
  if (orderMode === 'az') return [...valid].sort((a, b) => a.Name.localeCompare(b.Name))
  if (orderMode === 'size') return [...valid].sort((a, b) => b.Bookmarks.length - a.Bookmarks.length)
  if (orderMode === 'pinned') {
    return [...valid.filter(g => pins.has(g.Name)), ...valid.filter(g => !pins.has(g.Name))]
  }
  return valid
}

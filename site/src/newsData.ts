import { useEffect, useState } from 'react'
import { ORIGIN } from './links'

// Live data for 사업단소식, read from the original site's data files. Those files are edited by the
// original admin.html through the GitHub API, so posting keeps working without touching this site.

export type Notice = { date: string; category: string; title: string; content?: string; attachment?: string }
export type ArchiveItem = { date: string; title: string; path: string }
export type GalleryItem = { date: string; caption?: string; images?: string[]; image?: string }
export type Load<T> = { state: 'loading' } | { state: 'error' } | { state: 'ok'; items: T[] }

export const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|avif)$/i

// Paths in the data files are relative to the original site.
export const abs = (path: string) => (/^https?:\/\//.test(path) ? path : ORIGIN + path.replace(/^\.?\//, ''))

// admin.js appends real pixel size to uploads ("_1600x1200.jpg") so layout can reserve space.
export const sizeOf = (path?: string) => {
  const m = /_(\d{2,5})x(\d{2,5})\.[a-z0-9]+$/i.exec(path || '')
  return m ? { width: Number(m[1]), height: Number(m[2]) } : {}
}

// Upload prefix "timestamp_" is stripped for display, as on the original site.
export const displayName = (path: string) => (path.split('/').pop() || path).replace(/^\d+_/, '')

// "YYYY.MM.DD" → sortable number, independent of zero padding.
const dateValue = (d: string) => {
  const [y = 0, m = 0, day = 0] = String(d || '').split('.').map(Number)
  return y * 10000 + m * 100 + day
}
export const byDateDesc = <T extends { date: string }>(items: T[]) => [...items].sort((a, b) => dateValue(b.date) - dateValue(a.date))

export function useData<T extends { date: string }>(file: string, sort = true): Load<T> {
  const [data, setData] = useState<Load<T>>({ state: 'loading' })
  useEffect(() => {
    let alive = true
    fetch(`${ORIGIN}data/${file}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(file)
        return r.json() as Promise<T[]>
      })
      .then((items) => alive && setData({ state: 'ok', items: sort ? byDateDesc(items) : items }))
      .catch(() => alive && setData({ state: 'error' }))
    return () => {
      alive = false
    }
  }, [file, sort])
  return data
}


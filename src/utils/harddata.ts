// tek kaynak: public/database.txt
// loadDb() uygulama açılışında 1 kez; reloadDb() elle yenilemek için.
// get('shipments') gibi çağır; dot-path de olur: get('settings.currency')

/* eslint-disable @typescript-eslint/no-explicit-any */
let DB: any | null = null
const DEFAULT_PATH = '/database.txt'
const EVENT = 'harddata:updated'

function notify() {
    window.dispatchEvent(new CustomEvent(EVENT))
}

function deepClone<T>(v: T): T {
    return v == null ? v : JSON.parse(JSON.stringify(v))
}

export async function loadDb(path?: string): Promise<void> {
    const p = path || DEFAULT_PATH
    const res = await fetch(`${p}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`database.txt fetch failed: ${res.status}`)
    const txt = await res.text()
    try {
        DB = JSON.parse(txt)
        ;(window as any).__HARDDATA__ = DB
        notify()
    } catch (e) {
        console.error('database.txt JSON parse hatası:', e, txt)
        throw e
    }
}

export async function reloadDb(path?: string): Promise<void> {
    await loadDb(path)
}

export function get(path?: string): any {
    if (!DB) DB = (window as any).__HARDDATA__ || null
    if (!DB) return undefined
    if (!path) return deepClone(DB)
    const parts = path.split('.')
    let cur: any = DB
    for (const k of parts) {
        if (cur == null) return undefined
        cur = cur[k]
    }
    return deepClone(cur)
}

// İsteğe bağlı: bileşenler beklemek isterse
export async function ready(): Promise<void> {
    if (DB) return
    await new Promise<void>((resolve) => {
        const h = () => { window.removeEventListener(EVENT, h); resolve() }
        window.addEventListener(EVENT, h)
    })
}

// İsteğe bağlı: DB güncellenince tetiklenmek için
export function subscribe(cb: (db: any) => void): () => void {
    const handler = () => cb(get())
    window.addEventListener(EVENT, handler)
    // mevcut DB varsa hemen ver
    if (DB) cb(get())
    return () => window.removeEventListener(EVENT, handler)
}

export class reload {
}
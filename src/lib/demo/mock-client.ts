import { DEMO_DATA, DEMO_USER, DEMO_PERFIL } from './data'

// Genera un registro simulado con id y timestamps
function makeRow(data: unknown): Record<string, unknown> {
  const now = new Date().toISOString()
  const base = {
    id: 'demo-' + Math.random().toString(36).slice(2, 10),
    created_at: now,
    updated_at: now,
  }
  return { ...base, ...(data && typeof data === 'object' ? (data as Record<string, unknown>) : {}) }
}

// Resultado de mutaciones (insert/update/delete/upsert): encadenable y "awaitable".
// Soporta la cadena real de Supabase: .insert(x).select().single(), .update(x).eq(...), .delete().eq(...)
class MockMutation {
  private _rows: Record<string, unknown>[]

  constructor(table: string, payload: unknown, persist = false) {
    if (Array.isArray(payload)) {
      this._rows = payload.map(makeRow)
    } else if (payload === undefined) {
      this._rows = []
    } else {
      this._rows = [makeRow(payload)]
    }
    // Persistir inserts en los datos demo (en memoria) para que aparezcan en las listas
    if (persist && this._rows.length > 0) {
      if (!DEMO_DATA[table]) DEMO_DATA[table] = []
      ;(DEMO_DATA[table] as Record<string, unknown>[]).unshift(...this._rows)
    }
  }

  // Filtros (para update/delete) — no-ops que devuelven la misma cadena
  eq(): MockMutation { return this }
  neq(): MockMutation { return this }
  in(): MockMutation { return this }
  is(): MockMutation { return this }
  match(): MockMutation { return this }
  select(): MockMutation { return this }

  single() { return Promise.resolve({ data: this._rows[0] ?? makeRow({}), error: null }) }
  maybeSingle() { return Promise.resolve({ data: this._rows[0] ?? null, error: null }) }

  then(
    resolve: (v: { data: Record<string, unknown>[]; error: null }) => unknown,
    reject?: (e: unknown) => unknown
  ) {
    return Promise.resolve({ data: this._rows, error: null }).then(resolve as never, reject as never)
  }
}

// Simula el query builder de Supabase con datos de demo
class MockQueryBuilder {
  private _table: string
  private _filters: Array<(row: Record<string, unknown>) => boolean> = []
  private _limit: number | null = null
  private _orderBy: string | null = null
  private _orderAsc = true
  private _rangeFrom = 0
  private _rangeTo = 999

  constructor(table: string) {
    this._table = table
  }

  private _clone(): MockQueryBuilder {
    const q = new MockQueryBuilder(this._table)
    q._filters = [...this._filters]
    q._limit = this._limit
    q._orderBy = this._orderBy
    q._orderAsc = this._orderAsc
    q._rangeFrom = this._rangeFrom
    q._rangeTo = this._rangeTo
    return q
  }

  select(_cols?: string, _opts?: unknown): MockQueryBuilder { return this._clone() }
  eq(col: string, val: unknown): MockQueryBuilder { const q = this._clone(); q._filters.push(r => r[col] === val); return q }
  neq(col: string, val: unknown): MockQueryBuilder { const q = this._clone(); q._filters.push(r => r[col] !== val); return q }
  in(col: string, vals: unknown[]): MockQueryBuilder { const q = this._clone(); q._filters.push(r => vals.includes(r[col])); return q }
  is(col: string, val: unknown): MockQueryBuilder { const q = this._clone(); q._filters.push(r => val === null ? r[col] == null : r[col] === val); return q }
  gte(col: string, val: unknown): MockQueryBuilder { const q = this._clone(); q._filters.push(r => r[col] != null && (r[col] as never) >= (val as never)); return q }
  lte(col: string, val: unknown): MockQueryBuilder { const q = this._clone(); q._filters.push(r => r[col] != null && (r[col] as never) <= (val as never)); return q }
  gt(col: string, val: unknown): MockQueryBuilder { const q = this._clone(); q._filters.push(r => r[col] != null && (r[col] as never) > (val as never)); return q }
  lt(col: string, val: unknown): MockQueryBuilder { const q = this._clone(); q._filters.push(r => r[col] != null && (r[col] as never) < (val as never)); return q }
  ilike(_col: string, _val: unknown): MockQueryBuilder { return this._clone() }
  order(col: string, opts?: { ascending?: boolean }): MockQueryBuilder {
    const q = this._clone()
    q._orderBy = col
    q._orderAsc = opts?.ascending !== false
    return q
  }
  limit(n: number): MockQueryBuilder { const q = this._clone(); q._limit = n; return q }
  range(from: number, to: number): MockQueryBuilder { const q = this._clone(); q._rangeFrom = from; q._rangeTo = to; return q }

  insert(data: unknown) { return new MockMutation(this._table, data, true) }
  update(data: unknown) { return new MockMutation(this._table, data) }
  delete() { return new MockMutation(this._table, undefined) }
  upsert(data: unknown) { return new MockMutation(this._table, data, true) }

  private _getResults(): unknown[] {
    const rows = (DEMO_DATA[this._table] ?? []) as Record<string, unknown>[]
    let filtered = rows.filter(r => this._filters.every(f => f(r)))
    if (this._orderBy) {
      const key = this._orderBy
      const asc = this._orderAsc
      filtered = [...filtered].sort((a, b) => {
        const av = String(a[key] ?? '')
        const bv = String(b[key] ?? '')
        return asc ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return filtered
  }

  private _single(override?: unknown) {
    return Promise.resolve({ data: override ?? this._getResults()[0] ?? null, error: null })
  }

  single() { return this._single() }

  rpc(_fn: string) {
    const fakes: Record<string, string> = {
      generate_invoice_number: 'FAC-DEMO-0001',
      generate_budget_number: 'PRES-DEMO-0001',
      get_user_rol: 'admin_sismac',
    }
    return Promise.resolve({ data: fakes[_fn] ?? null, error: null })
  }

  // Thenable — await query
  then(resolve: (v: { data: unknown[]; error: null; count: number }) => unknown, reject?: (e: unknown) => unknown) {
    const results = this._getResults()
    const sliced = results.slice(this._rangeFrom, this._limit ? this._rangeFrom + this._limit : results.length)
    return Promise.resolve({ data: sliced, error: null, count: results.length }).then(resolve as never, reject as never)
  }
}

// Auth mock
const mockAuth = {
  getUser: () => Promise.resolve({ data: { user: DEMO_USER }, error: null }),
  getSession: () => Promise.resolve({ data: { session: { user: DEMO_USER } }, error: null }),
  signInWithPassword: (_creds: { email: string; password: string }) =>
    Promise.resolve({ data: { user: DEMO_USER, session: { access_token: 'demo', refresh_token: 'demo' } }, error: null }),
  signOut: () => Promise.resolve({ error: null }),
  onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
    cb('SIGNED_IN', { user: DEMO_USER })
    return { data: { subscription: { unsubscribe: () => {} } } }
  },
}

// Canal mock (realtime)
const mockChannel = {
  on: (_event: string, _opts: unknown, _cb: unknown) => mockChannel,
  subscribe: () => mockChannel,
  unsubscribe: () => Promise.resolve('ok' as const),
}

// Cliente mock completo
export function createMockClient() {
  return {
    auth: mockAuth,
    from: (table: string) => {
      const q = new MockQueryBuilder(table)
      // Attach rpc to the builder level too for convenience
      return q
    },
    rpc: (fn: string) => {
      const fakes: Record<string, string> = {
        generate_invoice_number: 'FAC-DEMO-0001',
        generate_budget_number: 'PRES-DEMO-0001',
        get_user_rol: 'admin_sismac',
      }
      return Promise.resolve({ data: fakes[fn] ?? null, error: null })
    },
    channel: (_name: string) => mockChannel,
    removeChannel: (_ch: unknown) => Promise.resolve(),
    storage: {
      from: (_bucket: string) => ({
        upload: () => Promise.resolve({ data: { path: 'demo/file.pdf' }, error: null }),
        getPublicUrl: (_path: string) => ({ data: { publicUrl: 'https://demo.storage/file.pdf' } }),
      }),
    },
  }
}

export { DEMO_PERFIL }

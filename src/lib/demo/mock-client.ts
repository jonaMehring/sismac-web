import { DEMO_DATA, DEMO_USER, DEMO_PERFIL } from './data'

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
  gte(_col: string, _val: unknown): MockQueryBuilder { return this._clone() }
  lte(_col: string, _val: unknown): MockQueryBuilder { return this._clone() }
  gt(_col: string, _val: unknown): MockQueryBuilder { return this._clone() }
  lt(_col: string, _val: unknown): MockQueryBuilder { return this._clone() }
  ilike(_col: string, _val: unknown): MockQueryBuilder { return this._clone() }
  order(col: string, opts?: { ascending?: boolean }): MockQueryBuilder {
    const q = this._clone()
    q._orderBy = col
    q._orderAsc = opts?.ascending !== false
    return q
  }
  limit(n: number): MockQueryBuilder { const q = this._clone(); q._limit = n; return q }
  range(from: number, to: number): MockQueryBuilder { const q = this._clone(); q._rangeFrom = from; q._rangeTo = to; return q }

  insert(_data: unknown) { return { select: () => this._single(DEMO_PERFIL) } }
  update(_data: unknown) { return { eq: () => ({ error: null }) } }
  delete() { return { eq: () => ({ error: null }) } }
  upsert(_data: unknown) { return this._clone() }

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

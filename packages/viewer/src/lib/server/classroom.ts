/**
 * In-memory classroom session store.
 *
 * A session = one teacher broadcasting their current pathname to N
 * student subscribers via Server-Sent Events. State lives only in this
 * Node process — adequate for local development and a single-instance
 * deployment. For multi-instance production, swap this for Redis or
 * Cloudflare Durable Objects.
 */

export type SessionId = string

export type SessionState = {
  pathname: string
  scrollY: number
}

type Subscriber = {
  send: (state: SessionState) => void
  close: () => void
}

type Session = SessionState & {
  subscribers: Set<Subscriber>
  updatedAt: number
}

const sessions = new Map<SessionId, Session>()

function ensure(id: SessionId): Session {
  let session = sessions.get(id)
  if (!session) {
    session = {
      pathname: '/',
      scrollY: 0,
      subscribers: new Set(),
      updatedAt: Date.now(),
    }
    sessions.set(id, session)
  }
  return session
}

export function setState(id: SessionId, update: Partial<SessionState>): void {
  const session = ensure(id)
  if (typeof update.pathname === 'string') session.pathname = update.pathname
  if (typeof update.scrollY === 'number') session.scrollY = update.scrollY
  session.updatedAt = Date.now()
  const snapshot: SessionState = {
    pathname: session.pathname,
    scrollY: session.scrollY,
  }
  for (const sub of session.subscribers) {
    try {
      sub.send(snapshot)
    } catch {
      session.subscribers.delete(sub)
    }
  }
}

export function getState(id: SessionId): SessionState {
  const session = ensure(id)
  return { pathname: session.pathname, scrollY: session.scrollY }
}

export function subscribe(id: SessionId, sub: Subscriber): () => void {
  const session = ensure(id)
  session.subscribers.add(sub)
  return () => session.subscribers.delete(sub)
}

export function isValidSessionId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{4,32}$/.test(id)
}

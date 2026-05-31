import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getState, setState, isValidSessionId } from '@/lib/server/classroom'

export const GET: RequestHandler = ({ params }) => {
  if (!isValidSessionId(params.id)) error(400, 'invalid session id')
  return json(getState(params.id))
}

export const POST: RequestHandler = async ({ params, request }) => {
  if (!isValidSessionId(params.id)) error(400, 'invalid session id')
  const body = (await request.json().catch(() => ({}))) as {
    pathname?: unknown
    scrollY?: unknown
  }
  const update: { pathname?: string; scrollY?: number } = {}
  if (typeof body.pathname === 'string') {
    if (!body.pathname.startsWith('/')) error(400, 'pathname must start with /')
    update.pathname = body.pathname
  }
  if (typeof body.scrollY === 'number' && Number.isFinite(body.scrollY)) {
    update.scrollY = Math.max(0, Math.floor(body.scrollY))
  }
  setState(params.id, update)
  return json({ ok: true })
}

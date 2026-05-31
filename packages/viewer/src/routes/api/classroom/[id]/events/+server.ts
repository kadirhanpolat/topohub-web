import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getState, subscribe, isValidSessionId } from '@/lib/server/classroom'

const encoder = new TextEncoder()

export const GET: RequestHandler = ({ params, request }) => {
  if (!isValidSessionId(params.id)) error(400, 'invalid session id')
  const sessionId = params.id

  let unsubscribe: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      const safeSend = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data))
        } catch {
          /* connection closed */
        }
      }

      safeSend(`event: init\ndata: ${JSON.stringify(getState(sessionId))}\n\n`)

      unsubscribe = subscribe(sessionId, {
        send: state =>
          safeSend(`event: navigate\ndata: ${JSON.stringify(state)}\n\n`),
        close: () => safeSend('event: closed\ndata: {}\n\n'),
      })

      heartbeat = setInterval(() => safeSend(`: ping\n\n`), 25_000)

      request.signal.addEventListener('abort', () => {
        unsubscribe?.()
        if (heartbeat) clearInterval(heartbeat)
        try {
          controller.close()
        } catch {
          /* already closed */
        }
      })
    },
    cancel() {
      unsubscribe?.()
      if (heartbeat) clearInterval(heartbeat)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

import { NextFunction, Request, Response } from "express"
import { EVENT_STREAM_HEADERS, RETRY_INTERVAL } from "../constants"
import { BroadcastType } from "../requests/join.request"

export const initEventStream = (req: Request, res: Response, next: NextFunction) => {
  res.set(EVENT_STREAM_HEADERS)
  res.flushHeaders()

  res.write(`retry: ${RETRY_INTERVAL}\n\n`)

  next()
}

export const writeRelay = (payload: BroadcastType, res: Response) => {
  const event = `event: ${payload.type ?? 'message'}\n`
  const data = `data: ${JSON.stringify(payload.payload)}\n`
  const id = payload.id ? `id: ${payload.id}\n` : ''
    
  console.log('Relaying', { event, data, id })

  res.write(`${event}${data}${id}\n`)
}

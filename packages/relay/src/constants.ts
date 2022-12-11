export const APP_PORT = process.env.APP_PORT
export const RETRY_INTERVAL = process.env.RETRY_INTERVAL

export const EVENT_STREAM_HEADERS = {
  'Cache-Control': 'no-cache',
  'Content-Type': 'text/event-stream',
  'Connection': 'keep-alive'
}

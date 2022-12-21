export type BroadcastType = {
  id?: string
  type: 'offer' | 'answer' | 'ice'
  payload: unknown
}

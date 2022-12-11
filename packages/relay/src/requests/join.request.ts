import { SdpTypes } from "../lib/client"

export type JoinRequestType = {
  type: SdpTypes | string
  sdp: string
}

export type BroadcastType = {
  id?: string
  type: 'offer' | 'answer' | 'ice'
  payload: unknown
}

import ky from 'ky'
import { useCallback, useEffect, useReducer, useState } from 'preact/hooks'
import { RELAY_URL } from '../constants'

type ConnectionStatusActionTypes = 'updatePcState' | 'updateIceState' | 'updateDataChannelState' | 'updateSignalingState' | 'clearState'
type ConnectionStatusActionType = { type: ConnectionStatusActionTypes, payload?: unknown }
type ConnectionStatusType = {
  pcState: RTCPeerConnectionState | null
  iceState: RTCIceConnectionState | null
  dataChannelState: RTCDataChannelState | null
  signalingState: RTCSignalingState | null
}

const initialConnectionStatus = { pcState: null, iceState: null, dataChannelState: null, signalingState: null }
const connectionStatusReducer = (state: ConnectionStatusType, action: ConnectionStatusActionType) => {
  switch (action.type) {
    case 'updatePcState':
      return { ...state, pcState: (action.payload as RTCPeerConnectionState | null) }
    case 'updateIceState':
      return { ...state, iceState: (action.payload as RTCIceConnectionState | null) }
    case 'updateDataChannelState':
      return { ...state, dataChannelState: (action.payload as RTCDataChannelState | null) }
    case 'updateSignalingState':
      return { ...state, signalingState: (action.payload as RTCSignalingState | null) }
    case 'clearState':
      return initialConnectionStatus
    default:
      throw('Invalid connection dispatch action')
  }
}

export const useRTC = () => {
  let [pc, setPc] = useState<RTCPeerConnection | null>(null)
  const [sessionId, setSessionId] = useState<string>()
  const [messageSource, setMessageSource] = useState<EventSource>()
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [connectionStatus, dispatchStatus] = useReducer(connectionStatusReducer, initialConnectionStatus)

  // Should run on `initialize` (when creating a new PC instance)
  useEffect(() => {
    if (!pc) return

    const fetchSessionId = async () => {
      setSessionId(await ky.get(`${RELAY_URL}/client/join`).text())
    }

    if (!sessionId) fetchSessionId()
    setMessageSource(new EventSource(`${RELAY_URL}/server/watch`))
  }, [pc])

  // Should run after `messageSource` and `sessionId` are available
  useEffect(() => {
    if (!messageSource || !sessionId || !mediaStream) return

    if (!pc) {
      console.error('RTCPeerConnection instance is missing, can not continue')
      return
    }

    if (pc.connectionState === 'new') {
      messageSource.addEventListener('answer', handleAnswer)
      messageSource.addEventListener('ice', handleICE)
      pc.addEventListener('negotiationneeded', sendOffer)
      pc.addEventListener('icecandidate', sendICE)
      pc.addEventListener('iceconnectionstatechange', handleICEStateChange)
      pc.addEventListener('connectionstatechange', handleStateChange)
      pc.addEventListener('signalingstatechange', handleSignalingChange)

      console.log('Events bound and ready to start')
    }

    addOrReplaceTrack(mediaStream)

    return () => {
      messageSource.close()
    }
  }, [messageSource, sessionId, mediaStream])

  const initialize = async (initialStream: MediaStream) => {
    if (pc?.connectionState !== 'connected') close()

    setPc(new RTCPeerConnection())
    setMediaStream(initialStream)
  }

  const close = () => {
    console.log('Clearing existing connections')

    messageSource?.close()
    pc?.close()

    //@ts-ignore
    pc = null

    dispatchStatus({ type: 'clearState' })
  }

  const addOrReplaceTrack = (stream: MediaStream) => {
    if (!pc) return

    const [track] = stream.getVideoTracks()

    const senders = pc.getSenders().filter(s => s.track?.kind === track.kind)
    senders?.length ? senders.forEach(s => s.replaceTrack(track)) : pc.addTrack(track)
  }

  const handleAnswer = useCallback(async (ev: MessageEvent<string>) => {
    if (!pc) return
    console.log("client-project#handleAnswer")

    const clientId = ev.lastEventId
    if (clientId !== sessionId) return

    const payload = JSON.parse(ev.data) as unknown as RTCSessionDescriptionInit

    const remoteDescription = new RTCSessionDescription(payload)
    await pc.setRemoteDescription(remoteDescription)
  }, [pc, sessionId])

  const handleICE = useCallback(async (ev: MessageEvent<string>) => {
    if (!pc) return
    console.log("client-project#handleICE")

    const clientId = ev.lastEventId

    if (clientId !== sessionId) return

    const payload = JSON.parse(ev.data) as unknown as RTCIceCandidateInit
    await pc.addIceCandidate(payload)
  }, [pc, sessionId])

  const sendOffer = useCallback(async () => {
    if (!pc) return
    console.log("client-project#sendOffer")

    const offer = await pc.createOffer()

    await ky.post(`${RELAY_URL}/client/broadcast`, { json: { id: sessionId, type: 'offer', payload: offer } })

    // Setting the local description will trigger the 'icecandidate' event
    // Hence we only do this after broadcasting the offer to the server
    await pc.setLocalDescription(offer)
  }, [pc, sessionId])

  const sendICE = useCallback(async (ev: RTCPeerConnectionIceEvent) => {
    if (!pc) return
    console.log("client-project#sendICE")

    await ky.post(`${RELAY_URL}/client/broadcast`, { json: { id: sessionId, type: 'ice', payload: ev.candidate } })
  }, [pc, sessionId])

  const handleICEStateChange = useCallback(() => {
    if (!pc) return
    console.log(`ICE State change: ${pc.iceConnectionState}`)

    dispatchStatus({ type: 'updateIceState', payload: pc.iceConnectionState })

    if (pc.iceConnectionState === 'closed') close()
  }, [pc])

  const handleStateChange = useCallback(() => {
    if (!pc) return
    console.log(`Connection state change: ${pc.connectionState}`)

    dispatchStatus({ type: 'updatePcState', payload: pc.connectionState })

    switch(pc.connectionState) {
      case 'connected':
        messageSource?.close()
        initDataChannel()
        break
      case 'closed':
        close()
        break
    }
  }, [pc])

  const handleSignalingChange = useCallback(() => {
    if (!pc) return
    console.log(`Signaling state change: ${pc.signalingState}`)

    dispatchStatus({ type: 'updateSignalingState', payload: pc.signalingState })

    if (pc.signalingState === 'closed') close()
  }, [pc])

  const initDataChannel = useCallback(() => {
    if (!pc) return
    const dataChannel = pc.createDataChannel('data')

    dataChannel.addEventListener('close', () => {
      dispatchStatus({ type: 'updateDataChannelState', payload: dataChannel.readyState })
      close()
    })

    dataChannel.addEventListener('open', () => dispatchStatus({ type: 'updateDataChannelState', payload: dataChannel.readyState }))
    dataChannel.addEventListener('error', () => dispatchStatus({ type: 'updateDataChannelState', payload: dataChannel.readyState }))
    dataChannel.addEventListener('closing', () => dispatchStatus({ type: 'updateDataChannelState', payload: dataChannel.readyState }))
    dataChannel.addEventListener('bufferedamountlow', () => dispatchStatus({ type: 'updateDataChannelState', payload: dataChannel.readyState }))
  }, [pc])

  return {
    initialize,
    setMediaStream,
    close,
    addOrReplaceTrack,
    connectionStatus,
    sessionId,
  }
}

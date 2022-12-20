import ky from 'ky'
import { useCallback, useEffect, useState } from 'preact/hooks'

export const useRTC = () => {
  let [pc, setPc] = useState<RTCPeerConnection>(new RTCPeerConnection())
  const [relayUrl, setRelayUrl] = useState<string>()
  const [sessionId, setSessionId] = useState<string>()
  const [messageSource, setMessageSource] = useState<EventSource>()
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>()

  // Should run on `initialize`
  useEffect(() => {
    if (!relayUrl) return

    const fetchSessionId = async () => {
      setSessionId(await ky.get(`${relayUrl}/client/join`).text())
    }

    if (!sessionId) fetchSessionId()
    setMessageSource(new EventSource(`${relayUrl}/server/watch`))
  }, [relayUrl, pc])

  // Should run after `messageSource` and `sessionId` are available
  useEffect(() => {
    if (!messageSource || !sessionId) {
      console.error('Can not continue without a connected message source or sessionId')
      return
    }

    messageSource.addEventListener('answer', handleAnswer)
    messageSource.addEventListener('ice', handleICE)
    pc.addEventListener('negotiationneeded', sendOffer)
    pc.addEventListener('icecandidate', sendICE)
    pc.addEventListener('iceconnectionstatechange', handleICEStateChange)
    pc.addEventListener('connectionstatechange', handleStateChange)
    pc.addEventListener('signalingstatechange', handleSignalingChange)

    console.log('Events bound and ready to start', { relayUrl, messageSource, pc })

    return () => {
      messageSource.close()
    }
  }, [messageSource, sessionId])

  const initialize = async (relayUrl: string) => {
    if (pc.connectionState === 'closed') {
      setPc(new RTCPeerConnection())
    }

    setRelayUrl(relayUrl)
  }

  const close = () => {
    console.log('Closing connection')

    messageSource?.close()
    pc.close()

    //@ts-ignore
    pc = null
  }

  const addOrReplaceTrack = (stream: MediaStream) => {
    const [track] = stream.getVideoTracks()

    const senders = pc.getSenders().filter(s => s.track?.kind === track.kind)
    senders?.length ? senders.forEach(s => s.replaceTrack(track)) : pc.addTrack(track)
  }

  const handleAnswer = useCallback(async (ev: MessageEvent<string>) => {
    console.log("client-project#handleAnswer")

    const clientId = ev.lastEventId
    if (clientId !== sessionId) return

    const payload = JSON.parse(ev.data) as unknown as RTCSessionDescriptionInit

    const remoteDescription = new RTCSessionDescription(payload)
    await pc.setRemoteDescription(remoteDescription)
  }, [pc, sessionId])

  const handleICE = useCallback(async (ev: MessageEvent<string>) => {
    console.log("client-project#handleICE")

    const clientId = ev.lastEventId

    if (clientId !== sessionId) return

    const payload = JSON.parse(ev.data) as unknown as RTCIceCandidateInit

    await pc.addIceCandidate(payload)
  }, [pc, sessionId])

  const sendOffer = useCallback(async () => {
    console.log("client-project#sendOffer")

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    await ky.post(`${relayUrl}/client/broadcast`, { json: { id: sessionId, type: 'offer', payload: offer } })
  }, [pc, relayUrl, sessionId])

  const sendICE = useCallback(async (ev: RTCPeerConnectionIceEvent) => {
    console.log("client-project#sendICE")

    await ky.post(`${relayUrl}/client/broadcast`, { json: { id: sessionId, type: 'ice', payload: ev.candidate } })
  }, [pc, relayUrl, sessionId])

  const handleICEStateChange = useCallback(() => {
    console.log(`ICE State change: ${pc.iceConnectionState}`)
  }, [pc])

  const handleStateChange = useCallback(() => {
    console.log(`Connection state change: ${pc.connectionState}`)

    setConnectionState(pc.connectionState)

    if (pc.connectionState === 'connected') {
      messageSource?.close()

      initDataChannel()
    }
  }, [pc])

  const handleSignalingChange = useCallback(() => {
    console.log(`Signaling state change: ${pc.signalingState}`)

    if (pc.signalingState === 'closed') setConnectionState('closed')
  }, [pc])

  const initDataChannel = useCallback(() => {
    const dataChannel = pc.createDataChannel('data')

    dataChannel.addEventListener('open', () => {
      console.log('Data channel is open')
    })

    dataChannel.addEventListener('close', () => {
      console.log('Data channel is closed, auto-disconnecting from client side')

      close()
    })
  }, [pc])

  return {
    initialize,
    close,
    addOrReplaceTrack,
    connectionState,
    sessionId,
  }
}

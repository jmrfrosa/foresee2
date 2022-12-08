import ky from 'ky'
import { useCallback, useEffect, useState } from 'preact/hooks'

export const useRTC = () => {
  const [pc, setPc] = useState<RTCPeerConnection>(new RTCPeerConnection())
  const [relayUrl, setRelayUrl] = useState<string>()
  const [sessionId, setSessionId] = useState<string>()
  const [messageSource, setMessageSource] = useState<EventSource>()
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>()

  useEffect(() => {
    if (!relayUrl) return
    console.log("Setting session id")

    const fetchSessionId = async () => {
      setSessionId(await ky.get(`${relayUrl}/client/join`).text())

      console.log('Session id is set:', sessionId)
    }

    fetchSessionId()
    setMessageSource(new EventSource(`${relayUrl}/server/watch`))

    console.log({ sessionId })
  }, [relayUrl])

  useEffect(() => {
    console.log('Session id changed', sessionId)
  }, [sessionId])

  useEffect(() => {
    if (!messageSource || !sessionId) {
      console.error('Can not continue without a connected message source or sessionId')
      return
    }

    messageSource.addEventListener('ice', handleICE)
    messageSource.addEventListener('answer', handleAnswer)
    pc.addEventListener('negotiationneeded', sendOffer)
    pc.addEventListener('icecandidate', sendICE)
    pc.addEventListener('connectionstatechange', handleStateChange)

    console.log('Events bound and ready to start', { relayUrl, messageSource, pc })

    return () => {
      messageSource.close()
    }
  }, [messageSource, sessionId])

  const initialize = async (relayUrl: string) => {
    setRelayUrl(relayUrl)
  }

  const addOrReplaceTrack = (stream: MediaStream) => {
    const [track] = stream.getVideoTracks()

    const senders = pc.getSenders().filter(s => s.track?.kind === track.kind)
    senders?.length ? senders.forEach(s => s.replaceTrack(track)) : pc.addTrack(track)
  }
  
  const handleAnswer = useCallback(async (ev: MessageEvent<string>) => {
    console.log("client-project#handleAnswer", { ev })

    const clientId = ev.lastEventId

    console.log(`CHECKING ${clientId} == ${sessionId}`)

    if (clientId !== sessionId) return

    const payload = JSON.parse(ev.data) as unknown as RTCSessionDescriptionInit

    console.log('ANSWER PAYLOAD', { payload })

    const remoteDescription = new RTCSessionDescription(payload)

    console.log('GENERATED REMOTE DESCRIPTION:', { remoteDescription })

    await pc.setRemoteDescription(remoteDescription)

    console.log('NEW REMOTE DESCRIPTION', { remoteDescription, pc: pc.remoteDescription })
  }, [pc, sessionId])

  const handleICE = useCallback(async (ev: MessageEvent<string>) => {
    console.log("client-project#handleICE", { sessionId })

    const clientId = ev.lastEventId

    if (clientId !== sessionId) return

    const payload = JSON.parse(ev.data) as unknown as RTCIceCandidateInit

    await pc.addIceCandidate(payload)
  }, [pc, sessionId])

  const sendOffer = useCallback(async () => {
    console.log("client-project#sendOffer", { sessionId, relayUrl })

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    await ky.post(`${relayUrl}/client/broadcast`, { json: { id: sessionId, type: 'offer', payload: offer } })
  }, [pc, relayUrl, sessionId])

  const sendICE = useCallback(async (ev: RTCPeerConnectionIceEvent) => {
    console.log("client-project#sendICE", { sessionId, relayUrl })

    await ky.post(`${relayUrl}/client/broadcast`, { json: { id: sessionId, type: 'ice', payload: ev.candidate } })
  }, [pc, relayUrl, sessionId])

  const handleStateChange = useCallback(() => {
    console.log(`Connection state change: ${pc.connectionState}`)

    setConnectionState(pc.connectionState)
  }, [])
  
  return {
    initialize,
    addOrReplaceTrack,
    connectionState,
    sessionId,
  }
}

import ky from "ky"
import { RELAY_URL } from "../constants"

export class RTCConnector {
  pcs: Map<string, RTCPeerConnection> = new Map()
  videos: Map<string, HTMLVideoElement> = new Map()
  messageSource: EventSource
  anchorNode: HTMLElement

  onConnectedPeer?: (pc: RTCPeerConnection) => void

  private constructor(messageSource: EventSource, anchorNode: HTMLElement) {
    this.messageSource = messageSource
    this.anchorNode = anchorNode

    this.bindListeners()
  }

  static async initialize(anchorNode: HTMLElement | null) {
    const messageSource = new EventSource(`${RELAY_URL}/clients/watch`)

    if (!anchorNode) throw('Not a valid HTMLElement')

    return new RTCConnector(messageSource, anchorNode)
  }

  bindListeners() {
    this.messageSource.addEventListener('offer', this.handleOffer.bind(this))
    this.messageSource.addEventListener('ice', this.handleICE.bind(this))
  }

  getPeerId(rtc: RTCPeerConnection) {
    for (const [peerId, conn] of this.pcs) {
      if (conn === rtc) return peerId
    }
  }

  private async handleOffer(ev: MessageEvent<string>) {
    console.log("visual-server#handleOffer")

    const clientId = ev.lastEventId
    const payload = JSON.parse(ev.data) as unknown as RTCSessionDescriptionInit

    const peerConnection = this.initConnection(clientId)
    const remoteDescription = new RTCSessionDescription(payload)
    peerConnection.setRemoteDescription(remoteDescription)

    const answer = await peerConnection.createAnswer()
    peerConnection.setLocalDescription(answer)

    ky.post(`${RELAY_URL}/server/broadcast`, { json: { id: clientId, type: 'answer', payload: answer } })
  }

  private async sendICE(ev: RTCPeerConnectionIceEvent) {
    console.log("visual-server#sendICE")
    const clientId = this.getPeerId(ev.target as RTCPeerConnection)

    await ky.post(`${RELAY_URL}/server/broadcast`, { json: { id: clientId, type: 'ice', payload: ev.candidate } })
  }

  private async handleICE(ev: MessageEvent<string>) {
    console.log("visual-server#handleICE")
    const clientId = ev.lastEventId

    const payload = JSON.parse(ev.data) as unknown as RTCIceCandidateInit

    const peerConnection = this.pcs.get(clientId)

    console.log(`peerConnection for ${clientId}`, peerConnection)
    if (!peerConnection) throw(`Could not find peer ${clientId}`)

    await peerConnection.addIceCandidate(payload)
  }

  private async handleStateChange(ev: Event) {
    const peerConnection = ev.target as RTCPeerConnection

    console.log(`Connection state change: ${peerConnection.connectionState}`)

    if (peerConnection.connectionState === 'connected' && this.onConnectedPeer) {
      this.onConnectedPeer(peerConnection)
    }
  }

  private async handleRemoteTrack(ev: RTCTrackEvent) {
    console.log("visual-server#handleRemoteTrack")

    const peerConnection = ev.target as RTCPeerConnection
    const videoElement = this.buildVideoElement(ev.track)

    const peerId = this.getPeerId(peerConnection)

    if (!peerId) {
      throw('Could not find peer')
    }

    this.videos.set(peerId, videoElement)
    this.anchorNode.appendChild(videoElement)
  }

  private buildVideoElement(track: MediaStreamTrack) {
    const remoteStream = new MediaStream([track])

    const videoElement = document.createElement('video')
    videoElement.srcObject = remoteStream
    videoElement.autoplay = true

    return videoElement
  }

  private initConnection(clientId: string) {
    const peerConnection = new RTCPeerConnection()
    this.pcs.set(clientId, peerConnection)

    peerConnection.onicecandidate = this.sendICE.bind(this)
    peerConnection.onconnectionstatechange = this.handleStateChange.bind(this)
    peerConnection.ontrack = this.handleRemoteTrack.bind(this)

    return peerConnection
  }
}

import ky from "ky"
import { RELAY_URL } from "../constants"

export class RTCConnector {
  pcs: Map<string, RTCPeerConnection>
  messageSource: EventSource
  anchorNode: HTMLElement
  videos: HTMLVideoElement[]

  onConnectedPeer?: (pc: RTCPeerConnection) => void

  private constructor(messageSource: EventSource, anchorNode: HTMLElement) {
    this.pcs = new Map()
    this.messageSource = messageSource
    this.anchorNode = anchorNode
    this.videos = []

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

    const remoteStream = new MediaStream([ev.track])

    const videoElement = document.createElement('video')
    videoElement.srcObject = remoteStream
    videoElement.autoplay = true

    this.videos.push(videoElement)

    this.anchorNode.appendChild(videoElement)
  }
  
  private getPeerId(rtc: RTCPeerConnection) {
    for (const [peerId, conn] of this.pcs) {
      if (conn === rtc) return peerId
    }
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

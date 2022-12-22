import ky from "ky"
import { RELAY_URL } from "../../constants"

export class RTCConnector {
  pcs: Map<string, RTCPeerConnection> = new Map()
  videos: Map<string, HTMLVideoElement> = new Map()
  messageSource: EventSource
  anchorNode: HTMLElement

  onConnectedPeer?: (pc: RTCPeerConnection) => void
  onDisconnectedPeer?: (pc: RTCPeerConnection) => void

  private constructor(messageSource: EventSource, anchorNode: HTMLElement) {
    this.messageSource = messageSource
    this.anchorNode = anchorNode

    this.bindListeners()
  }

  static async initialize(anchorNode: HTMLElement | null) {
    const sourceUrl = `${RELAY_URL}/clients/watch`
    const messageSource = new EventSource(sourceUrl)

    console.log(`Connected to ${sourceUrl}, %o`, messageSource)
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

    // Does this connection already exist?
    const existingConnection = this.pcs.get(clientId)

    const peerConnection = existingConnection ?? this.initConnection(clientId)
    const remoteDescription = new RTCSessionDescription(payload)
    peerConnection.setRemoteDescription(remoteDescription)

    const answer = await peerConnection.createAnswer()

    ky.post(`${RELAY_URL}/server/broadcast`, { json: { id: clientId, type: 'answer', payload: answer } })

    // Setting the local description will trigger the 'icecandidate' event
    // Hence we only do this after broadcasting the answer to the client
    peerConnection.setLocalDescription(answer)
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

  private async handleICEStateChange(ev: Event) {
    const peerConnection = ev.currentTarget as RTCPeerConnection

    console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`)
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
    const peerId = this.getPeerId(peerConnection)

    if (!peerId) {
      throw('Could not find peer')
    }

    const videoElement = this.buildVideoElement(ev.track, peerId)

    this.videos.set(peerId, videoElement)
    this.anchorNode.appendChild(videoElement)
  }

  private buildVideoElement(track: MediaStreamTrack, id: string) {
    const remoteStream = new MediaStream([track])

    const currentElement = document.getElementById(id) as HTMLVideoElement

    const videoElement = currentElement ?? document.createElement('video')
    videoElement.id = id
    videoElement.srcObject = remoteStream
    videoElement.width = 200
    videoElement.autoplay = true

    return videoElement
  }

  private initConnection(clientId: string) {
    const peerConnection = new RTCPeerConnection()
    this.pcs.set(clientId, peerConnection)

    peerConnection.ontrack = this.handleRemoteTrack.bind(this)
    peerConnection.ondatachannel = this.handleDataChannel.bind(this)
    peerConnection.onicecandidate = this.sendICE.bind(this)
    peerConnection.oniceconnectionstatechange = this.handleICEStateChange.bind(this)
    peerConnection.onconnectionstatechange = this.handleStateChange.bind(this)

    return peerConnection
  }

  private handleDataChannel(ev: RTCDataChannelEvent) {
    const dataChannel = ev.channel
    const peerConnection = ev.currentTarget as RTCPeerConnection

    const peerId = this.getPeerId(peerConnection)

    if (!peerId) {
      throw('Could not find peer')
    }

    dataChannel.addEventListener('open', () => {
      console.log('Data channel is open')
    })

    dataChannel.addEventListener('close', () => {
      console.log('Data channel is closed')

      const videoNode = document.getElementById(peerId)
      if (videoNode) this.anchorNode.removeChild(videoNode)

      this.videos.delete(peerId)

      if (this.onDisconnectedPeer) {
        this.onDisconnectedPeer(peerConnection)
      }

      this.pcs.delete(peerId)
    })
  }
}

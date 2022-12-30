import ky from "ky"
import { ICE_CONFIG, RELAY_URL } from "../../constants"
import { ControlPanel } from "../../external-gui/main"
import { globalStore } from "../../main"

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

    switch (peerConnection.iceConnectionState) {
      case 'closed':
      case 'disconnected':
      case 'failed':
        this.handleLostPeerConnection(peerConnection)
        break
    }
  }

  private async handleStateChange(ev: Event) {
    const peerConnection = ev.target as RTCPeerConnection

    console.log(`Connection state change: ${peerConnection.connectionState}`)

    switch (peerConnection.connectionState) {
      case 'closed':
      case 'disconnected':
      case 'failed':
        this.handleLostPeerConnection(peerConnection)
        break
      case 'connected':
        this.onConnectedPeer && this.onConnectedPeer(peerConnection)
        break
    }
  }

  private async handleSignalingStateChange(ev: Event) {
    const peerConnection = ev.target as RTCPeerConnection

    console.log(`Signaling state change: ${peerConnection.signalingState}`)

    switch (peerConnection.signalingState) {
      case 'closed':
        this.handleLostPeerConnection(peerConnection)
        break
    }
  }

  private async handleRemoteTrack(ev: RTCTrackEvent) {
    console.log("visual-server#handleRemoteTrack")

    const peerConnection = ev.target as RTCPeerConnection
    const peerId = this.getPeerId(peerConnection)

    if (!peerId) {
      throw('Could not find peer')
    }

    switch(ev.track.kind) {
      case 'video':
        const videoElement = this.buildVideoElement(ev.track, peerId)

        this.videos.set(peerId, videoElement)
        this.anchorNode.appendChild(videoElement)
      case 'audio':
        const controlPanel = globalStore.get('controlPanel') as ControlPanel | undefined

        if (!controlPanel)
          throw('Cannot receive audio, control panel is missing')

        controlPanel.addRemoteAudio(ev.track)
      default:
        return
    }
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
    const peerConnection = new RTCPeerConnection({ ...ICE_CONFIG })
    this.pcs.set(clientId, peerConnection)

    peerConnection.addEventListener('track', this.handleRemoteTrack.bind(this))
    peerConnection.addEventListener('datachannel', this.handleDataChannel.bind(this))
    peerConnection.addEventListener('icecandidate', this.sendICE.bind(this))
    peerConnection.addEventListener('iceconnectionstatechange', this.handleICEStateChange.bind(this))
    peerConnection.addEventListener('connectionstatechange', this.handleStateChange.bind(this))
    peerConnection.addEventListener('signalingstatechange', this.handleSignalingStateChange.bind(this))

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

      this.handleLostPeerConnection(peerConnection, peerId)
    })
  }

  private handleLostPeerConnection(peerConnection: RTCPeerConnection, peerId?: string) {
    const id = peerId ?? this.getPeerId(peerConnection)
    id && this.removePeerVideo(id)

    if (this.onDisconnectedPeer) {
      this.onDisconnectedPeer(peerConnection)
    }

    id && this.pcs.delete(id)
  }

  private removePeerVideo(peerId: string) {
    const videoNode = document.getElementById(peerId)
    if (videoNode) this.anchorNode.removeChild(videoNode)

    this.videos.delete(peerId)
  }
}

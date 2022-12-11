import ky from 'ky'

export class RTCConnector {
  relayUrl: string
  pc: RTCPeerConnection
  messageSource: EventSource
  sessionId: string

  private constructor(relayUrl: string, sessionId: string, messageSource: EventSource, videoDeviceId?: string) {
    this.relayUrl = relayUrl
    this.pc = new RTCPeerConnection()
    this.sessionId = sessionId
    this.messageSource = messageSource

    this.bindEvents()
    // this.assignMedia(videoDeviceId)
  }

  static async initialize(relayUrl: string, videoDeviceId?: string) {
    const sessionId = await ky.get(`${relayUrl}/client/join`).text()
    const messageSource = new EventSource(`${relayUrl}/server/watch`)

    return new RTCConnector(relayUrl, sessionId, messageSource, videoDeviceId)
  }

  bindEvents() {
    this.messageSource.addEventListener('answer', this.handleAnswer.bind(this))
    this.messageSource.addEventListener('ice', this.handleICE.bind(this))

    this.pc.onnegotiationneeded = this.sendOffer.bind(this)
    this.pc.onicecandidate = this.sendICE.bind(this)
    this.pc.onconnectionstatechange = this.handleStateChange.bind(this)
  }

  async assignMedia(videoDeviceId?: string) {
    const constraints: MediaStreamConstraints = videoDeviceId ? { video: { deviceId: videoDeviceId } } : { video: true }

    const videoStream = await navigator.mediaDevices.getUserMedia(constraints)

    for (const track of videoStream.getTracks()) {
      console.log('Adding track!', track)
      this.pc.addTrack(track)
    }
  }

  private async sendOffer() {
    console.log("client-project#sendOffer")

    const offer = await this.pc.createOffer()
    this.pc.setLocalDescription(offer)

    await ky.post(`${this.relayUrl}/client/broadcast`, { json: { id: this.sessionId, type: 'offer', payload: offer } })
  }

  private async sendICE(ev: RTCPeerConnectionIceEvent) {
    console.log("client-project#sendICE")

    await ky.post(`${this.relayUrl}/client/broadcast`, { json: { id: this.sessionId, type: 'ice', payload: ev.candidate } })
  }

  private async handleAnswer(ev: MessageEvent<string>) {
    console.log("client-project#handleAnswer")

    const clientId = ev.lastEventId

    if (clientId !== this.sessionId) return

    const payload = JSON.parse(ev.data) as unknown as RTCSessionDescriptionInit

    const remoteDescription = new RTCSessionDescription(payload)
    this.pc.setRemoteDescription(remoteDescription)
  }

  private async handleICE(ev: MessageEvent<string>) {
    console.log("client-project#handleICE")

    const clientId = ev.lastEventId

    if (clientId !== this.sessionId) return

    const payload = JSON.parse(ev.data) as unknown as RTCIceCandidateInit

    await this.pc.addIceCandidate(payload)
  }

  private async handleStateChange() {
    console.log(`Connection state change: ${this.pc.connectionState}`)
  }
}

type AudioAnalyzerOptions = {
  context?: AudioContextOptions
  analyzer?: AnalyserOptions
}

export class AudioAnalyzer {
  static defaultSampleRate = 48000

  audioDevice?: MediaStream | null
  context?: AudioContext | null
  analyzer?: AnalyserNode | null
  source?: MediaStreamAudioSourceNode | null
  audioData?: Uint8Array
  mediaDeviceList?: Record<string, string>

  constructor(audioDevice: MediaStream, options?: AudioAnalyzerOptions) {
    this.audioDevice = audioDevice

    this.buildAnalyzer({
      ...options,
      context: {
        ...(options?.context || {}),
        ...this.matchSampleRate()
      }
    })

    this.assignDeviceToSource()

    this.startAnalysis()
  }

  static async create() {
    const defaultAudioDevice = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: this.defaultSampleRate } })

    const mediaDeviceList = (await navigator.mediaDevices.enumerateDevices())
      .filter(device => device.kind === 'audioinput')
      .reduce((list, mediaDevice) => ({ ...list, [mediaDevice.label]: mediaDevice.deviceId }), {})

    const defaultAnalyzer = new AudioAnalyzer(defaultAudioDevice)
    defaultAnalyzer.mediaDeviceList = mediaDeviceList

    return defaultAnalyzer
  }

  sampleByteFrequency() {
    if (!this.audioData) return

    this.analyzer?.getByteFrequencyData(this.audioData)
  }

  startAnalysis() {
    const bufferSize = this.analyzer?.frequencyBinCount

    if (this.audioData?.length !== bufferSize) {
      this.audioData ??= new Uint8Array(bufferSize || 0)
    }
  }

  swapDevice(newAudioDevice: MediaStream) {
    const previousfftSize = this.analyzer?.fftSize || 256

    this.audioDevice = null
    this.source = null
    this.analyzer = null
    this.context = null
    this.audioDevice = newAudioDevice

    const { analyzer } = this.buildAnalyzer({ context: this.matchSampleRate() })

    analyzer.fftSize = previousfftSize

    this.startAnalysis()
  }

  averageInRange([rangeStart, rangeEnd]: [rangeStart: number, rangeEnd: number]) {
    if (rangeEnd <= rangeStart)
      return 0

    const beatScoreSum = this.audioData?.subarray(rangeStart, rangeEnd)?.reduce((sum, n) => sum + n)
    const beatScore = beatScoreSum && (beatScoreSum / (rangeEnd - rangeStart)) || 0

    return beatScore
  }

  private buildAnalyzer(options?: AudioAnalyzerOptions) {
    this.context = new AudioContext(options?.context)
    this.analyzer = new AnalyserNode(this.context, options?.analyzer)

    this.assignDeviceToSource()

    return { analyzer: this.analyzer, context: this.context }
  }

  private assignDeviceToSource() {
    if (!this.audioDevice || !this.context || !this.analyzer) return

    this.source = this.context.createMediaStreamSource(this.audioDevice)
    this.source?.connect(this.analyzer)
  }

  private matchSampleRate() {
    if (!this.audioDevice) throw('Missing audio device')

    const [track] = this.audioDevice.getAudioTracks()
    const trackSampleRate = track.getSettings().sampleRate

    return { sampleRate: trackSampleRate ?? AudioAnalyzer.defaultSampleRate }
  }
}

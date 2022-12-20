type AudioAnalyzerOptions = {
  context?: AudioContextOptions
  analyzer?: AnalyserOptions
}

export class AudioAnalyzer {
  audioDevice?: MediaStream | null
  context?: AudioContext | null
  analyzer?: AnalyserNode | null
  source?: MediaStreamAudioSourceNode | null
  audioData?: Uint8Array

  constructor(audioDevice: MediaStream, options?: AudioAnalyzerOptions) {
    this.audioDevice = audioDevice

    this.buildAnalyzer(options)
    this.assignDeviceToSource()

    this.startAnalysis()
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
    console.log('Deleting device', this.audioDevice?.id)
    const previousfftSize = this.analyzer?.fftSize || 256

    this.audioDevice = null
    this.source = null
    this.analyzer = null
    this.context = null
    this.audioDevice = newAudioDevice

    const { analyzer } = this.buildAnalyzer()
    this.assignDeviceToSource()

    analyzer.fftSize = previousfftSize

    this.startAnalysis()
  }

  private buildAnalyzer(options?: AudioAnalyzerOptions) {
    this.context = new AudioContext(options?.context)
    this.analyzer = new AnalyserNode(this.context, options?.analyzer)

    this.assignDeviceToSource()

    return { analyzer: this.analyzer, context: this.context }
  }

  private assignDeviceToSource() {
    if (!this.audioDevice || !this.context || !this.analyzer) return

    console.log('Assigning with new device', this.audioDevice?.id)

    this.source = this.context.createMediaStreamSource(this.audioDevice)
    this.source?.connect(this.analyzer)

    console.log(this.source)
  }
}

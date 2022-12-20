type AudioAnalyzerOptions = {
  context?: AudioContextOptions
  analyzer?: AnalyserOptions
}

export class AudioAnalyzer {
  audioDevice?: MediaStream
  context: AudioContext
  analyzer: AnalyserNode
  source?: MediaStreamAudioSourceNode

  constructor(audioDevice: MediaStream, options?: AudioAnalyzerOptions) {
    this.audioDevice = audioDevice
    this.context = new AudioContext(options?.context)
    this.analyzer = new AnalyserNode(this.context, options?.analyzer)

    this.assignDeviceToSource()
  }

  swapDevice(newAudioDevice: MediaStream) {
    this.audioDevice = newAudioDevice
    this.assignDeviceToSource()
  }

  private assignDeviceToSource() {
    if (!this.audioDevice) return

    this.source = this.context.createMediaStreamSource(this.audioDevice)
    this.source.connect(this.analyzer)
  }
}

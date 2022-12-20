import { AudioAnalyzer } from "./analyzer"

export class AudioVisualizer {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D | null
  audioAnalyzer: AudioAnalyzer

  constructor(audioAnalyzer: AudioAnalyzer, rootNode?: HTMLElement | null) {
    this.audioAnalyzer = audioAnalyzer
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')

    rootNode?.appendChild(this.canvas)
  }

  clearCanvas() {
    this.context?.clearRect(0 , 0, this.canvas.width, this.canvas.height)
  }

  frequencyVisualization() {
    const debugNode = document.getElementById('debug') as HTMLElement

    const { audioData } = this.audioAnalyzer

    if (this.audioAnalyzer.analyzer) this.audioAnalyzer.analyzer.fftSize = 256
    const bufferSize = this.audioAnalyzer.analyzer?.frequencyBinCount || 0
    this.audioAnalyzer.startAnalysis()

    this.clearCanvas()

    const draw = () => {
      if (!this.context) return

      this.audioAnalyzer.sampleByteFrequency()
      requestAnimationFrame(draw)

      debugNode.innerText = this.audioAnalyzer.audioDevice?.id ?? ''

      this.context.fillStyle = "rgb(0, 0, 0)"
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

      const barWidth = (this.canvas.width / bufferSize) * 1.5
      let barHeight
      let x = 0

      for (let i = 0; i < bufferSize; i++) {
        barHeight = (audioData as Uint8Array)[i];

        this.context.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
        this.context.fillRect(
          x,
          this.canvas.height - barHeight / 2,
          barWidth,
          barHeight / 2
        );

        x += barWidth + 1;
      }
    }

    draw()
  }
}

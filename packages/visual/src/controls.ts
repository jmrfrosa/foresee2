import './style.css'
import { ControlPanel } from "./external-gui/main";
import { ExternalParamsType } from "./external-gui/types"
import { AudioAnalyzer } from "./lib/audio/analyzer";
import { AudioVisualizer } from "./lib/audio/visualizer";
import { getScreenShare } from "./lib/communication/screen-capture";

// Ugly hack to simplify communication instead of going through BroadcastAPI
// We'll hijack the `window` object, which the parent tab has a reference to

export type ExtraWindowFields = {
  globals: {
    audioAnalyzer: AudioAnalyzer
    controls: ExternalParamsType
    sharedMedia?: MediaStream
  }
}
export type HijackedWindow = Window & typeof globalThis & ExtraWindowFields

const controlChannel = new BroadcastChannel('controlBroadcast')

let controlPanel: ControlPanel

controlChannel.addEventListener('message', async (ev) => {
  switch(ev.data.type) {
    case 'ready':
      const { globals: { audioAnalyzer } } = window as HijackedWindow
      const controlsNode = document.getElementById('controls')

      controlPanel = new ControlPanel({ audioAnalyzer, guiOptions: { autoPlace: false, width: 750 } })
      await controlPanel.buildGUI()

      controlsNode?.appendChild(controlPanel.gui.domElement);

      (window as HijackedWindow).globals = {
        controls: controlPanel.controls,
        audioAnalyzer: controlPanel.audioAnalyzer,
      }

      controlChannel.postMessage({ type: 'ready' })

      controlPanel.addEventListener('shareScreen', async () => {
        const displayMedia = await getScreenShare()

        if (!displayMedia) return

        (window as HijackedWindow).globals.sharedMedia = displayMedia
        controlChannel.postMessage({ type: 'share' })
      })

      const audioVisualizer = new AudioVisualizer(controlPanel.audioAnalyzer, controlsNode)
      audioVisualizer.frequencyVisualization()
      break
    default:
      return
  }
})

window.addEventListener('beforeunload', () => {
  controlChannel.postMessage({ type: 'closing' })
})

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
    globalStore: Map<string, unknown>
    audioAnalyzer: AudioAnalyzer
    controls: ExternalParamsType
    sharedMedia?: MediaStream
    controlPanel: ControlPanel
  }
}
export type HijackedWindow = Window & typeof globalThis & ExtraWindowFields

const controlChannel = new BroadcastChannel('controlBroadcast')

let controlPanel: ControlPanel

controlChannel.addEventListener('message', async (ev) => {
  switch(ev.data.type) {
    case 'ready':
      const controlsNode = document.getElementById('controls')

      await buildControlPanel(controlsNode)
      controlChannel.postMessage({ type: 'ready' })

      buildAudioVisualizer(controlsNode)
      break
    default:
      return
  }
})

window.addEventListener('beforeunload', () => {
  controlChannel.postMessage({ type: 'closing' })
})

async function buildControlPanel(parentNode?: HTMLElement | null) {
  const hw = (window || document.defaultView) as HijackedWindow
  const { globals: { audioAnalyzer, globalStore } } = hw

  controlPanel = new ControlPanel({ audioAnalyzer, guiOptions: { autoPlace: false, width: 750 }, globalStore })
  await controlPanel.buildGUI()

  parentNode?.appendChild(controlPanel.gui.domElement);

  hw.globals = {
    ...hw.globals,
    controls: controlPanel.controls,
    audioAnalyzer: controlPanel.audioAnalyzer,
    controlPanel: controlPanel
  }

  setControlPanelEvents(controlPanel)

  hw.globals.globalStore.set('controlPanel', controlPanel)
}

function setControlPanelEvents(controlPanel: ControlPanel) {
  controlPanel.addEventListener('shareScreen', async () => {
    const displayMedia = await getScreenShare()

    if (!displayMedia) return

    (window as HijackedWindow).globals.sharedMedia = displayMedia
    controlChannel.postMessage({ type: 'share' })
  })
}

function buildAudioVisualizer(parentNode?: HTMLElement | null) {
  const audioVisualizer = new AudioVisualizer(controlPanel.audioAnalyzer, parentNode)
  audioVisualizer.frequencyVisualization()
}

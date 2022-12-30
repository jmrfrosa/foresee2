import './style.css'
import { RTCConnector } from './lib/communication/rtc-connector'
import { AppScene } from './lib/3d/scene'
import { ExtraWindowFields, HijackedWindow } from './controls'
import { AudioAnalyzer } from './lib/audio/analyzer'
import { ExternalParamsType } from './external-gui/types'

export const globalStore = new Map()

const feedNode = document.getElementById('feeds')
const appNode = document.getElementById('scene')
const controlsNode = document.getElementById('controls')
const comm = await RTCConnector.initialize(feedNode)

const startAppBtn = document.createElement('button')
startAppBtn.type = 'button'
startAppBtn.textContent = 'Start Application'
controlsNode?.appendChild(startAppBtn)

const audioAnalyzer = await AudioAnalyzer.create()

// We set up a broadcast channel to signal messages to and from the control panel window
const controlChannel = new BroadcastChannel('controlBroadcast')

startAppBtn.addEventListener('click', () => {
  const controlPanelWindow = window.open('controls.html', 'Controls', 'popup=yes, width=1000, height=700')

  if (!controlPanelWindow)
    throw('Failed to open controls window');

  // Hackish way of creating an off-window control interface
  // We hijack the child `window` and use it to carry heavy objects around by reference
  (controlPanelWindow as any).globals = { audioAnalyzer }

  globalStore.set('controlPanelWindow', controlPanelWindow)

  // Signal is delayed so that control panel has enough time to set up its own channel
  setTimeout(() => {
    controlChannel.postMessage({ type: 'ready' })
  }, 200)

  controlChannel.addEventListener('message', (ev) => {
    switch(ev.data.type) {
      case 'ready':
        const { globals: { audioAnalyzer, controls } } = controlPanelWindow as Window & ExtraWindowFields

        if (!controls)
          throw('Missing controls!')

        startApp({ audioAnalyzer, controls })
        break
      case 'closing':
        // Handle control panel close, right now app will soft-lock
        break
      default:
        return
    }
  })
})

function startApp({ audioAnalyzer, controls }: { audioAnalyzer: AudioAnalyzer; controls: ExternalParamsType }) {
  const canvasScene = new AppScene(comm, audioAnalyzer, controls, appNode)

  startAppBtn.disabled = true

  controlChannel.addEventListener('message', (ev) => {
    switch(ev.data.type) {
      case 'share':
        const controlPanelWindow: HijackedWindow | undefined = globalStore.get('controlPanelWindow')

        if (!controlPanelWindow)
          throw('Control panel window was not found')

        const sharedMedia = controlPanelWindow.globals.sharedMedia

        if (sharedMedia) canvasScene.addDisplayStream(sharedMedia)
        break
    }
  })
}

import { GUI, GUIParams } from 'dat.gui'
import { AudioAnalyzer } from '../lib/audio/analyzer'
import { AudioParamPanel } from './audio-controls'
import { addBlendingParams } from './blending-controls'
import { addDeformParams } from './deform-controls'
import { addSceneParams } from './scene-controls'
import { ExternalParamsType } from './types'

type ControlPanels = {
  audioPanel?: AudioParamPanel
}

interface ControlPanelBuilder {
  audioAnalyzer: AudioAnalyzer
  guiOptions?: GUIParams
  controls?: ExternalParamsType
  globalStore: Map<string, unknown>
}

export class ControlPanel extends EventTarget {
  private _controls: Partial<ExternalParamsType>
  gui: GUI
  audioAnalyzer: AudioAnalyzer
  panels: ControlPanels = {}
  globalStore: Map<string, unknown>

  constructor({ audioAnalyzer, guiOptions, controls, globalStore }: ControlPanelBuilder) {
    super()
    this.gui = new GUI(guiOptions)
    this.audioAnalyzer = audioAnalyzer
    this._controls = controls ?? {}
    this.globalStore = globalStore
  }

  async buildGUI() {
    this.panels.audioPanel = new AudioParamPanel(this.gui, this.controls, this.audioAnalyzer, this)
    this.panels.audioPanel.build()

    addBlendingParams(this.gui, this.controls)
    addDeformParams(this.gui, this.controls)
    addSceneParams(this.gui, this.controls, this)
  }

  get controls() {
    return this._controls as ExternalParamsType
  }

  addRemoteAudio(track: MediaStreamTrack) {
    const mediaStreamFromTrack = new MediaStream([track])

    this.panels.audioPanel?.addDeviceToList(mediaStreamFromTrack)

    track.addEventListener('ended', () => {
      this.panels.audioPanel?.removeDeviceFromList(mediaStreamFromTrack)
    })
  }
}

import { GUI, GUIParams } from 'dat.gui'
import { AudioAnalyzer } from '../lib/audio/analyzer'
import { addAudioParams } from './audio-controls'
import { addBlendingParams } from './blending-controls'
import { addDeformParams } from './deform-controls'
import { addSceneParams } from './scene-controls'
import { ExternalParamsType } from './types'

interface ControlPanelBuilder {
  audioAnalyzer: AudioAnalyzer
  guiOptions?: GUIParams
  controls?: ExternalParamsType
}

export class ControlPanel extends EventTarget {
  private _controls: Partial<ExternalParamsType>
  gui: GUI
  audioAnalyzer: AudioAnalyzer

  constructor({ audioAnalyzer, guiOptions, controls }: ControlPanelBuilder) {
    super()
    this.gui = new GUI(guiOptions)
    this.audioAnalyzer = audioAnalyzer
    this._controls = controls ?? {}
  }

  async buildGUI() {
    addAudioParams(this.gui, this.controls, this.audioAnalyzer)
    addBlendingParams(this.gui, this.controls)
    addDeformParams(this.gui, this.controls)
    addSceneParams(this.gui, this.controls, this)
  }

  get controls() {
    return this._controls as ExternalParamsType
  }
}

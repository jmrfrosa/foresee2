import { GUI, GUIController } from 'dat.gui'
import { AudioAnalyzer } from '../lib/audio/analyzer';
import { ExternalParamsType } from './types'

export const audioControls = {
  audioDeviceId: '',
}

export class AudioParamPanel {
  gui: GUI
  params: Partial<ExternalParamsType>
  audioAnalyzer: AudioAnalyzer
  controllers: Record<string, GUIController> = {}

  constructor(gui: GUI, params: Partial<ExternalParamsType>, audioAnalyzer: AudioAnalyzer) {
    this.gui = gui
    this.params = params
    this.audioAnalyzer = audioAnalyzer
  }

  build() {
    this.params['audioControls'] = audioControls

    if (!this.audioAnalyzer.mediaDeviceList)
      throw('No media devices have been polled')

    const selectedDeviceId = this.audioAnalyzer.audioDevice?.getAudioTracks()[0].getSettings().deviceId

    const audioControlsFolder = this.gui.addFolder('audioControls')
    this.controllers.mediaDeviceListController = audioControlsFolder.add(audioControls, 'audioDeviceId', this.audioAnalyzer.mediaDeviceList)
      .setValue(selectedDeviceId)
      .onChange(this.handleMediaDeviceChange.bind(this))

    audioControlsFolder.open()
  }

  addDeviceToList(device: MediaStream) {
    const options = structuredClone(this.audioAnalyzer.mediaDeviceList)
    if(!options) return

    options[`Remote Audio ${device.id}`] = device

    this.controllers.mediaDeviceListController = this.controllers.mediaDeviceListController
      .options(options)
      .onChange(this.handleMediaDeviceChange.bind(this))

    this.controllers.mediaDeviceListController.updateDisplay()
  }

  removeDeviceFromList(device: MediaStream) {
    const options = structuredClone(this.audioAnalyzer.mediaDeviceList)
    if(!options) return

    delete options[`Remote Audio ${device.id}`]

    this.controllers.mediaDeviceListController = this.controllers.mediaDeviceListController
      .options(options)
      .onChange(this.handleMediaDeviceChange.bind(this))

    this.controllers.mediaDeviceListController.updateDisplay()
  }

  private async handleMediaDeviceChange(device: string | MediaStream) {
    const selectedAudioDevice = typeof device === 'string' ?
      await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: device } } }) :
      device

    this.audioAnalyzer.swapDevice(selectedAudioDevice)
  }
}

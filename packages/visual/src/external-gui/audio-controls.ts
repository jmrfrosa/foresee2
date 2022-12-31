import { GUI, GUIController } from 'dat.gui'
import { AudioAnalyzer } from '../lib/audio/analyzer';
import { ControlPanel } from './main';
import { ExternalParamsType } from './types'

export const audioControls = {
  audioDeviceId: '',
}

export class AudioParamPanel {
  gui: GUI
  params: Partial<ExternalParamsType>
  audioAnalyzer: AudioAnalyzer
  controllers: Record<string, GUIController> = {}
  controlPanel: ControlPanel

  constructor(gui: GUI, params: Partial<ExternalParamsType>, audioAnalyzer: AudioAnalyzer, controlPanel: ControlPanel) {
    this.gui = gui
    this.params = params
    this.audioAnalyzer = audioAnalyzer
    this.controlPanel = controlPanel
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

    const prevDevices = this.controlPanel.globalStore.get('remoteAudioDevices')
    this.controlPanel.globalStore.set('remoteAudioDevices', { ...(prevDevices ?? {}), [device.id]: device })
    options[`Remote Audio ${device.id}`] = device.id

    this.controllers.mediaDeviceListController = this.controllers.mediaDeviceListController
      .options(options)
      .onChange(this.handleMediaDeviceChange.bind(this))

    this.controllers.mediaDeviceListController.updateDisplay()
  }

  removeDeviceFromList(device: MediaStream) {
    const options = structuredClone(this.audioAnalyzer.mediaDeviceList)
    if(!options) return

    const prevDevices = this.controlPanel.globalStore.get('remoteAudioDevices') as Record<string, MediaStream>
    delete prevDevices[device.id]
    this.controlPanel.globalStore.set('remoteAudioDevices', prevDevices)

    delete options[`Remote Audio ${device.id}`]

    this.controllers.mediaDeviceListController = this.controllers.mediaDeviceListController
      .options(options)
      .onChange(this.handleMediaDeviceChange.bind(this))

    this.controllers.mediaDeviceListController.updateDisplay()
  }

  private async handleMediaDeviceChange(deviceId: string) {
    const remoteDevices = this.controlPanel.globalStore.get('remoteAudioDevices') as Record<string, MediaStream>
    const selectedAudioDevice = remoteDevices?.[deviceId] ??
      await navigator.mediaDevices.getUserMedia(
        {
          audio: {
            deviceId: { exact: deviceId },
            sampleRate: AudioAnalyzer.defaultSampleRate
          }
        }
      )

    this.audioAnalyzer.swapDevice(selectedAudioDevice)
  }
}

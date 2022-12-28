import { GUI } from 'dat.gui'
import { AudioAnalyzer } from '../lib/audio/analyzer';
import { ExternalParamsType } from './types'

export const audioControls = {
  audioDeviceId: '',
}

let defaultAudioDevice: MediaStream
let selectedAudioDevice: MediaStream
let audioAnalyzer: AudioAnalyzer

export const addAudioParams = async (gui: GUI, params: Partial<ExternalParamsType>) => {
  params['audioControls'] = audioControls

  const audioMediaDevices = await getAudioDevices()
  const audioDeviceList = audioMediaDevices.reduce((list, mediaDevice) => (
    { ...list, [mediaDevice.label]: mediaDevice.deviceId }
  ), {})

  initAudioAnalyzer()

  const selectedDeviceId = selectedAudioDevice.getAudioTracks()[0].getSettings().deviceId

  const audioControlsFolder = gui.addFolder('audioControls')
  audioControlsFolder.add(audioControls, 'audioDeviceId', audioDeviceList)
    .setValue(selectedDeviceId)
    .onChange(async (deviceId: string) => {
      selectedAudioDevice = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } })

      audioAnalyzer.swapDevice(selectedAudioDevice)
  })

  audioControlsFolder.open()

  return { audioAnalyzer }
}

const getAudioDevices = async () => {
  defaultAudioDevice = await navigator.mediaDevices.getUserMedia({ audio: true })
  selectedAudioDevice = defaultAudioDevice

  return (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'audioinput')
}

const initAudioAnalyzer = () => {
  audioAnalyzer = new AudioAnalyzer(selectedAudioDevice)
}

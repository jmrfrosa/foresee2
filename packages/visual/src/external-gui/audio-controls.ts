import { GUI } from 'dat.gui'
import { AudioAnalyzer } from '../lib/audio/analyzer';
import { ExternalParamsType } from './types'

export const audioControls = {
  audioDeviceId: '',
}

export const addAudioParams = async (gui: GUI, params: Partial<ExternalParamsType>, audioAnalyzer: AudioAnalyzer) => {
  params['audioControls'] = audioControls

  if (!audioAnalyzer.mediaDeviceList)
    throw('No media devices have been polled')

  const selectedDeviceId = audioAnalyzer.audioDevice?.getAudioTracks()[0].getSettings().deviceId

  const audioControlsFolder = gui.addFolder('audioControls')
  audioControlsFolder.add(audioControls, 'audioDeviceId', audioAnalyzer.mediaDeviceList)
    .setValue(selectedDeviceId)
    .onChange(async (deviceId: string) => {
      const selectedAudioDevice = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } })

      audioAnalyzer.swapDevice(selectedAudioDevice)
  })

  audioControlsFolder.open()
}

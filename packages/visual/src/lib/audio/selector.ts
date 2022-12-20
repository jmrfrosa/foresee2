import { AudioAnalyzer } from "./analyzer"

export const buildAudioSelector = async (rootNode?: HTMLElement | null) => {
  const defaultAudioDevice = await navigator.mediaDevices.getUserMedia({ audio: true })
  const audioDevices = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'audioinput')
  let selectedAudioDevice = defaultAudioDevice

  const audioAnalyzer = new AudioAnalyzer(selectedAudioDevice)

  const audioSelectNode = document.createElement('select')
  audioSelectNode.id = 'audio-select'

  for (const audioDevice of audioDevices) {
    const selectOpt = document.createElement('option')
    selectOpt.value = audioDevice.deviceId
    selectOpt.text = audioDevice.label

    audioSelectNode.appendChild(selectOpt)
  }

  rootNode?.appendChild(audioSelectNode)

  audioSelectNode.addEventListener('change', async (ev) => {
    const deviceId = (ev.target as HTMLSelectElement).value

    selectedAudioDevice = await navigator.mediaDevices.getUserMedia({ audio: { deviceId } })
    audioAnalyzer.swapDevice(selectedAudioDevice)
  })

  return { audioAnalyzer }
}

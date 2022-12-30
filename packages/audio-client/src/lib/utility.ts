type GetAudioStreamOptions = {
  deviceId?: string
}

export const getAudioStream = async (options?: GetAudioStreamOptions) => {
  const deviceId = options?.deviceId

  const constraints: MediaStreamConstraints = deviceId ?
    { audio: { deviceId: { exact: deviceId } } } :
    { audio: true }

  return await navigator.mediaDevices.getUserMedia(constraints)
}

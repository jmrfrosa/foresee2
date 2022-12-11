type GetVideoStreamOptions = {
  deviceId?: string
}

export const getVideoStream = async (options?: GetVideoStreamOptions) => {
  const deviceId = options?.deviceId

  const constraints: MediaStreamConstraints = deviceId ?
    { video: { deviceId: { exact: deviceId } } } :
    { video: true }

  return await navigator.mediaDevices.getUserMedia(constraints)
}

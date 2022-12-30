import { AppScene } from "../3d/scene"

export const shareScreenForScene = (scene: AppScene, options?: DisplayMediaStreamOptions) => {
  return async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia(options)

      scene.addDisplayStream(displayStream)
    } catch (err) {
      console.error(err)
    }
  }
}

export const getScreenShare = async (options?: DisplayMediaStreamOptions) => {
  try {
    return await navigator.mediaDevices.getDisplayMedia(options)
  } catch (err) {
    console.error(err)
    return
  }
}

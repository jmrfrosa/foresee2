import { PostProcess } from "@babylonjs/core"
import { AppScene } from "../scene"

export const addOverlayEffect = (appScene: AppScene) => {
  const postProcess = new PostProcess('overlayPostProcess', './shaders/screen', null, ['displayVideoSampler'], 1.0, appScene.mainCamera)
  postProcess.onApply = (effect) => {
    if (appScene.displayVideo)
      effect.setTexture('displayVideoSampler', appScene.displayVideo)
  }
}

import { PostProcess } from "@babylonjs/core"
import { AppScene } from "../scene"

export const addTestEffect = (appScene: AppScene) => {
  const postProcess = new PostProcess('testPostProcess', './shaders/test', ['threshold', 'screenSize', 'time'], ['displayVideoSampler'], 1.0, appScene.mainCamera)
  postProcess.onApply = (effect) => {
    effect.setFloat('threshold', 1.0)
    effect.setFloat2('screenSize', postProcess.width, postProcess.height)
  }

  let time = 0
  postProcess.onBeforeRender = (effect) => {
    time += appScene.mainScene.deltaTime * 0.01
    effect.setFloat('time', time)

    if (appScene.displayVideo)
      effect.setTexture('displayVideoSampler', appScene.displayVideo)
  }
}

import { PostProcess } from "@babylonjs/core"
import { AppScene } from "../scene"
import { SceneContextType } from "../types"

export const addOverlayEffect = (appScene: AppScene, context: SceneContextType) => {
  const postProcess = new PostProcess(
    'overlayPostProcess',
    './shaders/screen',
    ['blendingLayerAlpha', 'mixAlpha'],
    ['displayVideoSampler'],
    1.0,
    appScene.mainCamera
  )

  postProcess.onApply = (effect) => {
    if (appScene.displayVideo)
      effect.setTexture('displayVideoSampler', appScene.displayVideo)
  }

  postProcess.onBeforeRender = (effect) => {
    effect.setFloat('blendingLayerAlpha', context.externalParams.ppBlendingParams.blendingLayerAlpha)
    effect.setFloat('mixAlpha', context.externalParams.ppBlendingParams.mixAlpha)
  }
}

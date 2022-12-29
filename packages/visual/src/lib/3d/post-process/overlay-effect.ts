import { PostProcess } from "@babylonjs/core"
import { AppScene } from "../scene"
import { SceneContextType } from "../types"

export const addOverlayEffect = (appScene: AppScene, context: SceneContextType) => {
  const postProcess = new PostProcess(
    'overlayPostProcess',
    './shaders/screen',
    ['blendingLayerAlpha', 'blendingMixAlpha', 'mixAlpha', 'dryBlendFactor', 'effectBlendFactor', 'wetBlendFactor'],
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
    effect.setFloat('blendingMixAlpha', context.externalParams.ppBlendingParams.blendingMixAlpha)
    effect.setFloat('mixAlpha', context.externalParams.ppBlendingParams.mixAlpha)
    effect.setFloat('dryBlendFactor', context.externalParams.ppBlendingParams.dryBlendFactor)
    effect.setFloat('effectBlendFactor', context.externalParams.ppBlendingParams.effectBlendFactor)
    effect.setFloat('wetBlendFactor', context.externalParams.ppBlendingParams.wetBlendFactor)
  }
}

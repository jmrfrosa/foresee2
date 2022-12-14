import { SkyboxTypes } from "../lib/3d/builders/sky.builder"

export type ExternalParamsType = {
  audioControls: {
    audioDeviceId: string
  }
  ppBlendingParams: {
    blendingLayerAlpha: number
    blendingMixAlpha: number
    mixAlpha: number
    dryBlendFactor: number
    effectBlendFactor: number
    wetBlendFactor: number
  },
  meshDeformParams: {
    yWebcamRange: number
    webcamScale: number
    webcamRadius: number
    xWebcamOffset: number
    yWebcamOffset: number
    zWebcamOffset: number
    xVertexDeformIntensity: number
    yVertexDeformIntensity: number
    zVertexDeformIntensity: number
    offsetModulatorIntensity: number
    offsetShakerIntensity: number
    waterBeatDeformIntensity: number
    waterBeatRangeStart: number
    waterBeatRangeEnd: number
    waterWaveSpeed: number
    waterWaveHeight: number
    waterWaveCount: number
    waterWaveLength: number
    waterWindIntensity: number
    cameraFov: number
    cameraBeatDeformIntensity: number
    cameraBeatRangeStart: number
    cameraBeatRangeEnd: number
    cameraAutoRotation: boolean
  }
  sceneParams: {
    timeFactor: number
    shareScreen: () => void
    skybox: SkyboxTypes
    skyboxRenderStepsMain: number
    skyboxRenderStepsSecondary: number
    skyboxHeight: number
    skyboxCloudFactor: number
    skyboxHaze: number
    skyboxStarTreshold: number
  }
}

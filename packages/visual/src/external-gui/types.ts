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
    xVertexDeformIntensity: number
    yVertexDeformIntensity: number
    zVertexDeformIntensity: number
    offsetModulatorIntensity: number
    offsetShakerIntensity: number
  }
  sceneParams: {
    timeFactor: number
    shareScreen: () => void
  }
}

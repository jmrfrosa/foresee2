export type ExternalParamsType = {
  audioControls: {
    audioDeviceId: string
  }
  ppBlendingParams: {
    blendingLayerAlpha: number
    mixAlpha: number
  },
  meshDeformParams: {
    xVertexDeformIntensity: number
    yVertexDeformIntensity: number
    zVertexDeformIntensity: number
    offsetModulatorIntensity: number
    offsetShakerIntensity: number
  }
}

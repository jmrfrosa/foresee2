import { GUI } from 'dat.gui'
import { ExternalParamsType } from './types'

export const ppBlendingParams = {
  blendingLayerAlpha: 0.0,
  blendingMixAlpha: 0.0,
  mixAlpha: 0.0,
  dryBlendFactor: 1.0,
  effectBlendFactor: 0.0,
  wetBlendFactor: 0.0,
}

export const addBlendingParams = (gui: GUI, params: Partial<ExternalParamsType>) => {
  params['ppBlendingParams'] = ppBlendingParams

  const paramControlsFolder = gui.addFolder('paramControls')
  paramControlsFolder.add(params.ppBlendingParams, 'blendingLayerAlpha', 0, 1, 0.01)
  paramControlsFolder.add(params.ppBlendingParams, 'blendingMixAlpha', 0, 1, 0.01)
  paramControlsFolder.add(params.ppBlendingParams, 'dryBlendFactor', 0, 1, 0.01)
  paramControlsFolder.add(params.ppBlendingParams, 'effectBlendFactor', 0, 1, 0.01)
  paramControlsFolder.add(params.ppBlendingParams, 'wetBlendFactor', 0, 1, 0.01)
  paramControlsFolder.open()
}

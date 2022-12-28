import { GUI } from 'dat.gui'
import { ExternalParamsType } from './types'

export const ppBlendingParams = {
  blendingLayerAlpha: 0.0,
  mixAlpha: 0.0,
}

export const addBlendingParams = (gui: GUI, params: Partial<ExternalParamsType>) => {
  params['ppBlendingParams'] = ppBlendingParams

  const paramControlsFolder = gui.addFolder('paramControls')
  paramControlsFolder.add(params.ppBlendingParams, 'blendingLayerAlpha', 0, 1, 0.01)
  paramControlsFolder.add(params.ppBlendingParams, 'mixAlpha', 0, 1, 0.01)
  paramControlsFolder.open()
}

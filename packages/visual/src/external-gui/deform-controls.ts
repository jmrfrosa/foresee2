import { GUI } from 'dat.gui'
import { ExternalParamsType } from './types'

export const meshDeformParams = {
  xVertexDeformIntensity: 0.0,
  yVertexDeformIntensity: 0.0,
  zVertexDeformIntensity: 0.0,
  offsetModulatorIntensity: 0.0,
  offsetShakerIntensity: 0.0,
}

export const addDeformParams = (gui: GUI, params: Partial<ExternalParamsType>) => {
  params['meshDeformParams'] = meshDeformParams

  const deformControlsFolder = gui.addFolder('deformControls')
  deformControlsFolder.add(params.meshDeformParams, 'xVertexDeformIntensity', 0, 10, 0.01)
  deformControlsFolder.add(params.meshDeformParams, 'yVertexDeformIntensity', 0, 10, 0.01)
  deformControlsFolder.add(params.meshDeformParams, 'zVertexDeformIntensity', 0, 10, 0.01)
  deformControlsFolder.add(params.meshDeformParams, 'offsetModulatorIntensity', 0, 10, 0.01)
  deformControlsFolder.add(params.meshDeformParams, 'offsetShakerIntensity', 0, 10, 0.01)
  deformControlsFolder.open()
}

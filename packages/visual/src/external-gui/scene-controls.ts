import { GUI } from 'dat.gui'
import { ExternalParamsType } from './types'

export const sceneParams = {
  timeFactor: 1.0
}

export const addSceneParams = (gui: GUI, params: Partial<ExternalParamsType>) => {
  params['sceneParams'] = sceneParams

  const sceneControlsFolder = gui.addFolder('sceneControls')
  sceneControlsFolder.add(params.sceneParams, 'timeFactor', -10, 10, 0.01)
  sceneControlsFolder.open()
}

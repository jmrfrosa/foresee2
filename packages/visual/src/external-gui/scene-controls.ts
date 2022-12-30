import { GUI } from 'dat.gui'
import { ControlPanel } from './main'
import { ExternalParamsType } from './types'

export const addSceneParams = (gui: GUI, params: Partial<ExternalParamsType>, controlPanel: ControlPanel) => {
  const sceneParams = {
    timeFactor: 1.0,
    shareScreen: () => {
      console.log('sharing screen')
      controlPanel.dispatchEvent(new Event('shareScreen'))
    }
  }

  params['sceneParams'] = sceneParams

  const sceneControlsFolder = gui.addFolder('sceneControls')
  sceneControlsFolder.add(params.sceneParams, 'timeFactor', -10, 10, 0.01)
  sceneControlsFolder.add(params.sceneParams, 'shareScreen')
  sceneControlsFolder.open()
}

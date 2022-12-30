import { GUI } from 'dat.gui'
import { SkyboxTypes } from '../lib/3d/builders/sky.builder'
import { ControlPanel } from './main'
import { ExternalParamsType } from './types'

export const addSceneParams = (gui: GUI, params: Partial<ExternalParamsType>, controlPanel: ControlPanel) => {
  const sceneParams = {
    timeFactor: 1.0,
    shareScreen: () => {
      controlPanel.dispatchEvent(new Event('shareScreen'))
    },
    skybox: SkyboxTypes.SIMPLE,
  }

  params['sceneParams'] = sceneParams

  const sceneControlsFolder = gui.addFolder('sceneControls')
  sceneControlsFolder.add(params.sceneParams, 'timeFactor', -10, 10, 0.01)
  sceneControlsFolder.add(params.sceneParams, 'shareScreen')
  sceneControlsFolder
    .add(params.sceneParams, 'skybox', { 'Basic': SkyboxTypes.SIMPLE, 'Complex': SkyboxTypes.COMPLEX })
    .onChange((value: SkyboxTypes) => {
      controlPanel.dispatchEvent(new CustomEvent('skyboxChange', { detail: { value } }))
  })
  sceneControlsFolder.open()
}

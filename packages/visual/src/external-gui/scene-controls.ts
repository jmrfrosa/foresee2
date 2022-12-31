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
    skyboxRenderStepsMain: 16,
    skyboxRenderStepsSecondary: 16,
    skyboxHeight: 500,
    skyboxCloudFactor: 0.6,
    skyboxHaze: 0.5,
    skyboxStarTreshold: 0.99,
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

  const skyboxControlsFolder = gui.addFolder('Complex Skybox Parameters')
  skyboxControlsFolder.add(params.sceneParams, 'skyboxRenderStepsMain', 1, 100, 1)
  skyboxControlsFolder.add(params.sceneParams, 'skyboxRenderStepsSecondary', 1, 100, 1)
  skyboxControlsFolder.add(params.sceneParams, 'skyboxHeight', 0, 3000, 1)
  skyboxControlsFolder.add(params.sceneParams, 'skyboxCloudFactor', 0, 2, 0.001)
  skyboxControlsFolder.add(params.sceneParams, 'skyboxHaze', 0, 2, 0.001)
  skyboxControlsFolder.add(params.sceneParams, 'skyboxStarTreshold', 0, 1, 0.001)
}

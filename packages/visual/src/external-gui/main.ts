import { GUI, GUIParams } from 'dat.gui'
import { addAudioParams } from './audio-controls'
import { addBlendingParams } from './blending-controls'
import { addDeformParams } from './deform-controls'
import { addSceneParams } from './scene-controls'
import { ExternalParamsType } from './types'

export const buildExternalGUI = async (options?: GUIParams) => {
  const gui = new GUI(options)
  const externalParams: Partial<ExternalParamsType> = {}

  const { audioAnalyzer } = await addAudioParams(gui, externalParams)
  addBlendingParams(gui, externalParams)
  addDeformParams(gui, externalParams)
  addSceneParams(gui, externalParams)

  return { gui, externalParams: externalParams as ExternalParamsType, audioAnalyzer }
}

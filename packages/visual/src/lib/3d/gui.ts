import { Nullable, Scene } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui"

export const buildGUI = (scene: Nullable<Scene>) => {
  const UITexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene)

  const fullScreenToggle = GUI.Button.CreateSimpleButton('fsbtn', 'Fullscreen')
  fullScreenToggle.height = '30px'
  fullScreenToggle.width = '100px'
  fullScreenToggle.paddingTop = '5px'
  fullScreenToggle.paddingRight = '5px'
  fullScreenToggle.paddingBottom = '5px'
  fullScreenToggle.paddingLeft = '5px'
  fullScreenToggle.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  fullScreenToggle.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP

  UITexture.addControl(fullScreenToggle)

  return {
    UITexture,
    fullScreenToggle,
  }
}

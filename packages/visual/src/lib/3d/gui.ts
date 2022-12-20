import { Nullable, Scene } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui"

export const buildGUI = (scene: Nullable<Scene>) => {
  const UITexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene)

  const paramSlider = new GUI.Slider()
  paramSlider.value = 0
  paramSlider.step = 0.1
  paramSlider.maximum = 10
  paramSlider.minimum = -10
  paramSlider.height = '30px'
  paramSlider.width = '1000px'
  paramSlider.paddingTop = '5px'
  paramSlider.paddingRight = '5px'
  paramSlider.paddingBottom = '5px'
  paramSlider.paddingLeft = '5px'
  paramSlider.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  paramSlider.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP

  // const debugLabel = new GUI.TextBlock()
  // debugLabel.text = 'Hello'
  // debugLabel.fontSize = 26
  // debugLabel.resizeToFit = true
  // debugLabel.paddingTop = '5px'
  // debugLabel.paddingRight = '5px'
  // debugLabel.paddingBottom = '5px'
  // debugLabel.paddingLeft = '5px'
  // debugLabel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  // debugLabel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP

  // const debugRect = new GUI.Rectangle()
  // debugRect.background = 'black'
  // debugRect.height = '30px'
  // debugRect.width = '100px'

  // const debugRectText = new GUI.TextBlock()
  // debugRectText.color = 'white'
  // debugRect.addControl(debugRectText)

  // UITexture.addControl(debugLabel)
  // UITexture.addControl(debugRect)

  UITexture.addControl(paramSlider)

  return { UITexture, paramSlider }
}

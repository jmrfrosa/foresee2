import { Nullable, Scene } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui"

export const buildGUI = (scene: Nullable<Scene>) => {
  const UITexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene)

  const mainPanel = new GUI.StackPanel('panel')
  mainPanel.color = 'white'
  mainPanel.paddingTop = '5px'
  mainPanel.paddingRight = '5px'
  mainPanel.paddingBottom = '5px'
  mainPanel.paddingLeft = '5px'
  mainPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  mainPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP

  const fullScreenToggle = GUI.Button.CreateSimpleButton('fsbtn', 'Fullscreen')
  fullScreenToggle.height = '30px'
  fullScreenToggle.width = '100px'

  mainPanel.addControl(fullScreenToggle)

  // const paramSlider = new GUI.Slider()
  // paramSlider.value = 0
  // paramSlider.step = 0.1
  // paramSlider.maximum = 10
  // paramSlider.minimum = -10
  // paramSlider.height = '30px'
  // paramSlider.width = '1000px'
  // paramSlider.paddingTop = '5px'
  // paramSlider.paddingRight = '5px'
  // paramSlider.paddingBottom = '5px'
  // paramSlider.paddingLeft = '5px'
  // paramSlider.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  // paramSlider.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP

  const debugLabel = new GUI.TextBlock()
  debugLabel.text = 'Debug'
  debugLabel.fontSize = 26
  debugLabel.resizeToFit = true

  mainPanel.addControl(debugLabel)

  // const debugRect = new GUI.Rectangle()
  // debugRect.background = 'black'
  // debugRect.height = '30px'
  // debugRect.width = '100px'

  // const debugRectText = new GUI.TextBlock()
  // debugRectText.color = 'white'
  // debugRect.addControl(debugRectText)

  // UITexture.addControl(debugLabel)
  // UITexture.addControl(debugRect)

  // UITexture.addControl(paramSlider)

  UITexture.addControl(mainPanel)

  return {
    UITexture,
    fullScreenToggle,
    // paramSlider,
    debugLabel
  }
}

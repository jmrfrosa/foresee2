import { GUI } from 'dat.gui'
import { ControlPanel } from './main'
import { ExternalParamsType } from './types'

export const meshDeformParams = {
  xWebcamRange: 10,
  yWebcamRange: 5,
  zWebcamRange: 3,
  xWebcamOffset: 0.0,
  yWebcamOffset: 0.0,
  zWebcamOffset: 0.0,
  webcamScale: 1.0,

  xVertexDeformIntensity: 0.0,
  yVertexDeformIntensity: 0.0,
  zVertexDeformIntensity: 0.0,
  offsetModulatorIntensity: 0.0,
  offsetShakerIntensity: 0.0,

  waterBeatDeformIntensity: 0.0,
  waterBeatRangeStart: 7,
  waterBeatRangeEnd: 42,
  waterWaveSpeed: 0.0,
  waterWaveHeight: 0.0,
  waterWaveCount: 0,
  waterWaveLength: 0.1,
  waterWindIntensity: 0.0,

  cameraFov: 0.8,
  cameraBeatDeformIntensity: 0.0,
  cameraBeatRangeStart: 7,
  cameraBeatRangeEnd: 42,
  cameraAutoRotation: false,
}

export const addDeformParams = (gui: GUI, params: Partial<ExternalParamsType>, controlPanel: ControlPanel) => {
  params['meshDeformParams'] = meshDeformParams

  const webcamControlsFolder = gui.addFolder('webcamControls')
  webcamControlsFolder.add(params.meshDeformParams, 'xWebcamRange', 0, 100, 0.1)
  webcamControlsFolder.add(params.meshDeformParams, 'yWebcamRange', 0, 10, 0.1)
  webcamControlsFolder.add(params.meshDeformParams, 'zWebcamRange', 0, 100, 0.1)
  webcamControlsFolder.add(params.meshDeformParams, 'xWebcamOffset', 0, 100, 0.01)
  webcamControlsFolder.add(params.meshDeformParams, 'yWebcamOffset', 0, 100, 0.01)
  webcamControlsFolder.add(params.meshDeformParams, 'zWebcamOffset', 0, 100, 0.01)
  webcamControlsFolder.add(params.meshDeformParams, 'webcamScale', 0, 50, 0.01)
  webcamControlsFolder.open()

  const waterControlsFolder = gui.addFolder('waterControls')
  waterControlsFolder.add(params.meshDeformParams, 'waterBeatDeformIntensity', 0, 0.1, 0.001)
  waterControlsFolder.add(params.meshDeformParams, 'waterBeatRangeStart', 0, 255, 1)
  waterControlsFolder.add(params.meshDeformParams, 'waterBeatRangeEnd', 1, 256, 1)
  waterControlsFolder.add(params.meshDeformParams, 'waterWaveSpeed', 0, 10, 0.01)
  waterControlsFolder.add(params.meshDeformParams, 'waterWaveHeight', 0, 10, 0.01)
  waterControlsFolder.add(params.meshDeformParams, 'waterWaveCount', 0, 50, 1)
  waterControlsFolder.add(params.meshDeformParams, 'waterWaveLength', 0, 10, 0.01)
  waterControlsFolder.add(params.meshDeformParams, 'waterWindIntensity', 0, 10, 0.01)
  waterControlsFolder.open()

  const deformControlsFolder = gui.addFolder('deformControls')
  deformControlsFolder.add(params.meshDeformParams, 'xVertexDeformIntensity', 0, 10, 0.01)
  deformControlsFolder.add(params.meshDeformParams, 'yVertexDeformIntensity', 0, 10, 0.01)
  deformControlsFolder.add(params.meshDeformParams, 'zVertexDeformIntensity', 0, 10, 0.01)
  deformControlsFolder.add(params.meshDeformParams, 'offsetModulatorIntensity', 0, 10, 0.01)
  deformControlsFolder.add(params.meshDeformParams, 'offsetShakerIntensity', 0, 10, 0.01)
  deformControlsFolder.open()

  const cameraControlsFolder = gui.addFolder('cameraControls')
  cameraControlsFolder.add(params.meshDeformParams, 'cameraFov', 0.01, Math.PI, 0.01)
  cameraControlsFolder.add(params.meshDeformParams, 'cameraBeatDeformIntensity', 0, 0.1, 0.00001)
  cameraControlsFolder.add(params.meshDeformParams, 'cameraBeatRangeStart', 0, 255, 1)
  cameraControlsFolder.add(params.meshDeformParams, 'cameraBeatRangeEnd', 1, 256, 1)
  cameraControlsFolder.add(params.meshDeformParams, 'cameraAutoRotation').onChange((value) =>
    controlPanel.dispatchEvent(new CustomEvent('cameraAutoRotate', { detail: { value } }))
  ).name('Switch to rotating camera')
  cameraControlsFolder.open()
}

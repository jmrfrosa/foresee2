import './style.css'
import { RTCConnector } from './lib/communication/rtc-connector'
import { AppScene } from './lib/3d/scene'
import { AudioVisualizer } from './lib/audio/visualizer'
import { shareScreenForScene } from './lib/communication/screen-capture'
import { buildExternalGUI } from './external-gui/main'

const feedNode = document.getElementById('feeds')
const appNode = document.getElementById('scene')
const controlsNode = document.getElementById('controls')
const shareScreenBtn = document.getElementById('share-screen')
const comm = await RTCConnector.initialize(feedNode)

const { gui, externalParams, audioAnalyzer } = await buildExternalGUI({ autoPlace: true, width: 750 })
controlsNode?.appendChild(gui.domElement)

const audioVisualizer = new AudioVisualizer(audioAnalyzer, controlsNode)
audioVisualizer.frequencyVisualization()

const canvasScene = new AppScene(comm, audioAnalyzer, externalParams, appNode)

shareScreenBtn?.addEventListener('click', shareScreenForScene(canvasScene))

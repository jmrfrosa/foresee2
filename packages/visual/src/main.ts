import './style.css'
import { RTCConnector } from './lib/communication/rtc-connector'
import { AppScene } from './lib/3d/scene'
import { buildAudioSelector } from './lib/audio/selector'
import { AudioVisualizer } from './lib/audio/visualizer'
import { shareScreenForScene } from './lib/communication/screen-capture'

const feedNode = document.getElementById('feeds')
const appNode = document.getElementById('scene')
const controlsNode = document.getElementById('controls')
const shareScreenBtn = document.getElementById('share-screen')
const comm = await RTCConnector.initialize(feedNode)

const { audioAnalyzer } = await buildAudioSelector(controlsNode)

const audioVisualizer = new AudioVisualizer(audioAnalyzer, controlsNode)

audioVisualizer.frequencyVisualization()

const canvasScene = new AppScene(comm, audioAnalyzer, appNode)

shareScreenBtn?.addEventListener('click', shareScreenForScene(canvasScene))

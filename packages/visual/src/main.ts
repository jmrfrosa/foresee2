import './style.css'
import { RTCConnector } from './lib/rtc-connector'
import { AppScene } from './lib/scene'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div></div>
`

const rootNode = document.getElementById('app')
const comm = await RTCConnector.initialize(rootNode)

const scene = new AppScene(comm)

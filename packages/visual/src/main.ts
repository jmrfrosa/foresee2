import './style.css'
import { RTCConnector } from './lib/rtc-connector'
import { AppScene } from './lib/scene'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div></div>
`

const feedNode = document.getElementById('feeds')
const appNode = document.getElementById('app')
const comm = await RTCConnector.initialize(feedNode)

new AppScene(comm, appNode)

import './style.css'
import { RTCConnector } from './lib/rtc-connector'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div></div>
`

const rootNode = document.getElementById('app')
const comm = await RTCConnector.initialize(rootNode)

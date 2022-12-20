import { Scene, Mesh } from "@babylonjs/core"
import { AudioAnalyzer } from "../audio/analyzer"
import { RTCConnector } from "../communication/rtc-connector"
import { buildGUI } from "./gui"

export type SceneContextType = {
  scene: Scene
  comm: RTCConnector
  audioAnalyzer: AudioAnalyzer
  peers: Map<string, { video: HTMLVideoElement, mesh: Mesh }>
  GUI: ReturnType<typeof buildGUI>
}

import { Engine, Scene } from "@babylonjs/core"
import { AudioAnalyzer } from "../audio/analyzer"
import { RTCConnector } from "../communication/rtc-connector"
import { buildGUI } from "./gui"

export type SceneContextType = {
  scene: Scene
  engine: Engine
  comm: RTCConnector
  audioAnalyzer: AudioAnalyzer
  peers: Map<string, { video: HTMLVideoElement, objects: unknown[], beforeRender?: () => unknown }>
  GUI: ReturnType<typeof buildGUI>
}

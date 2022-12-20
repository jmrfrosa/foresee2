import { Scene, Mesh } from "@babylonjs/core"
import { RTCConnector } from "../rtc-connector"
import { buildGUI } from "./gui"

export type SceneContextType = {
  scene: Scene
  comm: RTCConnector
  peers: Map<string, { video: HTMLVideoElement, mesh: Mesh }>
  GUI: ReturnType<typeof buildGUI>
}

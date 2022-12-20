import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, Nullable } from "@babylonjs/core";
import { RTCConnector } from "../communication/rtc-connector";
import { buildGUI } from "./gui";
import { SceneContextType } from "./types";
import { onConnectionEvent } from "./events/on-connection";
import { onDisconnectionEvent } from "./events/on-disconnection";
import { AudioAnalyzer } from "../audio/analyzer";

export class AppScene {
  constructor(comm: RTCConnector, audioAnalyzer: AudioAnalyzer, rootNode?: Nullable<HTMLElement>) {
    // create the canvas html element and attach it to the webpage
    const canvas = document.createElement("canvas")
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.id = "gameCanvas"

    const parentNode = rootNode ?? document.body
    parentNode.appendChild(canvas)

    // initialize babylon scene and engine
    const engine = new Engine(canvas, true)
    const scene = new Scene(engine)

    const camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene)
    camera.attachControl(canvas, true)
    const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene)

    const peers = new Map<string, { video: HTMLVideoElement, mesh: Mesh }>()

    const GUI = buildGUI(scene)

    const sceneContext: SceneContextType = { comm, peers, audioAnalyzer, scene, GUI }

    comm.onConnectedPeer = onConnectionEvent(sceneContext)
    comm.onDisconnectedPeer = onDisconnectionEvent(sceneContext)

    // hide/show the Inspector
    window.addEventListener("keydown", (
      ev) => {
        // Shift+Ctrl+Alt+I
        if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
          if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide()
          } else {
            scene.debugLayer.show()
          }
        }
      });

      // run the main render loop
      engine.runRenderLoop(() => {
        scene.render()
      }
    );
  }
}

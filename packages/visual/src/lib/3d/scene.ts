import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, Vector3, HemisphericLight, Mesh, Nullable, UniversalCamera, MeshBuilder } from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials"
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

    //const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene)
    const camera = new UniversalCamera("Camera", new Vector3(0, 1, -5), scene)
    camera.attachControl(canvas, true)
    //camera.wheelPrecision = 100

    const ground = MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, scene)
    ground.material = new GridMaterial('groundMaterial', scene)

    const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene)

    const peers = new Map<string, { video: HTMLVideoElement, objects: unknown[] }>()

    const GUI = buildGUI(scene)

    GUI.fullScreenToggle.onPointerUpObservable.add(() => {
      engine.switchFullscreen(false)
    })

    const sceneContext: SceneContextType = { comm, peers, engine, audioAnalyzer, scene, GUI }

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

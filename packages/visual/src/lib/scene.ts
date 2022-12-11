import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, VideoTexture, StandardMaterial } from "@babylonjs/core";
import { RTCConnector } from "./rtc-connector";

export class AppScene {
  constructor(comm: RTCConnector) {
    // create the canvas html element and attach it to the webpage
    const canvas = document.createElement("canvas")
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.id = "gameCanvas"
    document.body.appendChild(canvas)

    // initialize babylon scene and engine
    const engine = new Engine(canvas, true)
    const scene = new Scene(engine)

    const camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene)
    camera.attachControl(canvas, true)
    const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene)
    const sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene)

    comm.onConnectedPeer = (pc) => {
      const peerId = comm.getPeerId(pc)

      if (!peerId) return
      const peerVideo = comm.videos.get(peerId)

      if (!peerVideo) return

      const webcamMaterial = new StandardMaterial('webcam-mat', scene)
      const webcamTexture = new VideoTexture('webcam', peerVideo, scene)
      webcamMaterial.diffuseTexture = webcamTexture

      sphere.material = webcamMaterial
    }

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

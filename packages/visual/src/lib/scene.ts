import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { PointColor, Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, VideoTexture, StandardMaterial, PointsCloudSystem, Color4, CloudPoint } from "@babylonjs/core";
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

    const peers = new Map<string, { video: HTMLVideoElement, mesh: Mesh }>()

    comm.onConnectedPeer = async (pc) => {
      const peerId = comm.getPeerId(pc)

      if (!peerId) return
      const peerVideo = comm.videos.get(peerId)

      if (!peerVideo) return

      const { videoHeight, videoWidth } = peerVideo
      const webcamTexture = new VideoTexture('webcam', peerVideo, scene)

      const plane = MeshBuilder.CreatePlane(`baseMesh-${peerId}`, {
        height: videoHeight / 2,
        width: videoWidth / 2,
      }, scene);

      const particleCloud = new PointsCloudSystem('pcs', 1, scene)

      // Somehow only works like this, using UV and index 1
      particleCloud.addSurfacePoints(plane, 100000, PointColor.UV, 1)
      const particleMesh = await particleCloud.buildMeshAsync()

      if (particleMesh.material) {
        (particleMesh.material as StandardMaterial).emissiveTexture = webcamTexture
        particleMesh.material.pointSize = 2
      }

      // particleCloud.updateParticle = function(particle) {
      //   this.counter++
      //   particle.position.x += 0.001 * Math.cos(0.01 * this.counter * Math.PI * 2)
      //   particle.position.y += 0.001 * Math.sin(0.01 * this.counter * Math.PI * 2)
      //   particle.position.z += 0.001 * Math.sin(0.01 * this.counter * Math.PI * 2)

      //   return particle
      // }

      // scene.registerBeforeRender(() => {
      //   particleCloud.setParticles();
      // });

      plane.dispose();

      peers.set(peerId, { video: peerVideo, mesh: plane })
    }

    comm.onDisconnectedPeer = (pc) => {
      const peerId = comm.getPeerId(pc)

      if (!peerId) return

      const p = peers.get(peerId)
      if (p) {
        console.log('Disposing!')
        p.mesh.dispose()
        peers.delete(peerId)
      }
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

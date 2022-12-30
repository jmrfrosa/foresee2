import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, Vector3, HemisphericLight, Nullable, UniversalCamera, VideoTexture, Camera, AssetsManager, GlowLayer } from "@babylonjs/core";
import { RTCConnector } from "../communication/rtc-connector";
import { buildGUI } from "./gui";
import { SceneContextType } from "./types";
import { onConnectionEvent } from "./events/on-connection";
import { onDisconnectionEvent } from "./events/on-disconnection";
import { AudioAnalyzer } from "../audio/analyzer";
import { addOverlayEffect } from "./post-process/overlay-effect";
import { ExternalParamsType } from "../../external-gui/types";
import { SkyBuilder } from "./builders/sky.builder";
import { WaterBuilder } from "./builders/water.builder";

export class AppScene {
  engine: Engine
  mainScene: Scene
  mainCamera: Camera
  displayVideo?: VideoTexture

  constructor(comm: RTCConnector, audioAnalyzer: AudioAnalyzer, externalParams: ExternalParamsType, rootNode?: Nullable<HTMLElement>) {
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

    engine.adaptToDeviceRatio = true

    this.mainScene = scene
    this.engine = engine

    const camera = new UniversalCamera("Camera", new Vector3(0, 1, -5), scene)
    camera.attachControl(canvas, true)
    camera.speed = 0.2

    this.mainCamera = camera

    // const ground = MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, scene)
    // ground.material = new GridMaterial('groundMaterial', scene)

    const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene)

    const assetManager = new AssetsManager(scene)
    assetManager.addTextureTask('loadWaterTexture', './textures/water/waterbump.png')

    assetManager.onTaskSuccessObservable.add((_tasks) => {
      const peers = new Map<string, { video: HTMLVideoElement, objects: unknown[] }>()

      const GUI = buildGUI(scene)

      GUI.fullScreenToggle.onPointerUpObservable.add(() => {
        engine.switchFullscreen(false)
      })

      const glowLayer = new GlowLayer('meshGlowLayer', scene, {
        blurKernelSize: 32,
      })
      glowLayer.intensity = 0.6

      const sceneContext: SceneContextType = { comm, peers, engine, audioAnalyzer, scene, GUI, externalParams }

      comm.onConnectedPeer = onConnectionEvent(sceneContext)
      comm.onDisconnectedPeer = onDisconnectionEvent(sceneContext)

      const skyBuilder = new SkyBuilder(sceneContext)
      const { skyBox: skyMesh } = skyBuilder.buildGenerative()

      const waterBuilder = new WaterBuilder(sceneContext)
      waterBuilder.build(skyMesh)

      addOverlayEffect(this, sceneContext)

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
    })

    assetManager.load()
  }

  addDisplayStream(displayStream: MediaStream) {
    const videoElement = document.createElement('video')
    videoElement.srcObject = displayStream
    videoElement.width = 200
    videoElement.autoplay = true
    videoElement.playsInline = true

    const videoTexture = new VideoTexture('shareDisplay', videoElement, this.mainScene)

    this.displayVideo = videoTexture

    const feedsNode = document.getElementById('feeds')
    feedsNode?.appendChild(videoElement)

    displayStream.getTracks().forEach(track => {
      track.addEventListener('ended', () => {
        videoTexture.dispose()
        feedsNode?.removeChild(videoElement)
        videoElement.remove()

        this.displayVideo = undefined
      })
    })
  }
}

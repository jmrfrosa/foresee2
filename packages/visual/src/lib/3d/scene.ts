import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, Vector3, HemisphericLight, Nullable, UniversalCamera, VideoTexture, Camera, AssetsManager, GlowLayer, ArcRotateCamera } from "@babylonjs/core";
import { RTCConnector } from "../communication/rtc-connector";
import { buildGUI } from "./gui";
import { SceneContextType } from "./types";
import { onConnectionEvent } from "./events/on-connection";
import { onDisconnectionEvent } from "./events/on-disconnection";
import { AudioAnalyzer } from "../audio/analyzer";
import { addOverlayEffect } from "./post-process/overlay-effect";
import { ExternalParamsType } from "../../external-gui/types";
import { SkyboxTypes, SkyBuilder } from "./builders/sky.builder";
import { WaterBuilder } from "./builders/water.builder";

export class AppScene {
  engine: Engine
  mainScene: Scene
  mainCamera: Camera
  freeCamera: UniversalCamera
  autoRotateCamera: ArcRotateCamera
  displayVideo?: VideoTexture
  sceneBuilders?: {
    skybox: SkyBuilder
    water: WaterBuilder
  }
  peerObjects?: Map<string, { video: HTMLVideoElement, objects: unknown[] }>

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

    const freeCamera = new UniversalCamera("FreeCamera", new Vector3(0, 1, -5), scene)
    freeCamera.attachControl(canvas, true)
    freeCamera.speed = 0.2

    // WASD
    freeCamera.keysUp.push(87)
    freeCamera.keysDown.push(83)
    freeCamera.keysRight.push(68)
    freeCamera.keysLeft.push(65)

    this.mainCamera = freeCamera
    this.freeCamera = freeCamera
    this.autoRotateCamera = new ArcRotateCamera("AutoRotateCamera", 3 * Math.PI / 2, Math.PI / 8, 50, Vector3.Zero(), scene)
    this.autoRotateCamera.useAutoRotationBehavior = true

    // const ground = MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, scene)
    // ground.material = new GridMaterial('groundMaterial', scene)

    new HemisphericLight("light1", new Vector3(1, 1, 0), scene)

    const peers = new Map<string, { video: HTMLVideoElement, objects: unknown[] }>()
    this.peerObjects = peers

    const assetManager = new AssetsManager(scene)
    assetManager.addTextureTask('loadWaterTexture', './textures/water/waterbump.png')
    assetManager.onTaskSuccessObservable.add((_tasks) => {
      const GUI = buildGUI(scene)

      GUI.fullScreenToggle.onPointerUpObservable.add(() => { engine.switchFullscreen(false) })

      const glowLayer = new GlowLayer('meshGlowLayer', scene, {
        blurKernelSize: 32,
      })
      glowLayer.intensity = 0.6

      const sceneContext: SceneContextType = { comm, peers, engine, audioAnalyzer, scene, GUI, externalParams }

      comm.onConnectedPeer = onConnectionEvent(sceneContext)
      comm.onDisconnectedPeer = onDisconnectionEvent(sceneContext)

      const skyBuilder = new SkyBuilder(sceneContext)
      const skyMesh = skyBuilder.build(externalParams.sceneParams.skybox).skyBox

      const waterBuilder = new WaterBuilder(sceneContext)
      waterBuilder.build(skyMesh)

      this.sceneBuilders = {
        skybox: skyBuilder,
        water: waterBuilder,
      }

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
          const fftIntensity = audioAnalyzer.averageInRange([
            externalParams.meshDeformParams.cameraBeatRangeStart,
            externalParams.meshDeformParams.cameraBeatRangeEnd
          ]) * externalParams.meshDeformParams.cameraBeatDeformIntensity

          this.mainCamera.fov = (externalParams.meshDeformParams.cameraFov * fftIntensity) || 0.8

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

  swapSkybox(newSkybox: SkyboxTypes) {
    const newMesh = this.sceneBuilders?.skybox.build(newSkybox).skyBox

    if (!newMesh) return

    this.sceneBuilders?.water.addMeshReflection(newMesh)
  }

  switchCamera() {
    if (this.mainCamera.name === 'FreeCamera') {
      this.mainCamera = this.autoRotateCamera;
      (this.mainCamera as ArcRotateCamera).position = this.freeCamera.position.clone();
      (this.mainCamera as ArcRotateCamera).rotation = this.freeCamera.rotation.clone();
    } else {
      this.mainCamera = this.freeCamera;
      (this.mainCamera as UniversalCamera).position = this.autoRotateCamera.position.clone();
      (this.mainCamera as UniversalCamera).rotation = this.autoRotateCamera.rotation.clone();
    }

    this.mainCamera.attachControl()
    this.mainScene.activeCamera = this.mainCamera
  }
}

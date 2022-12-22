import { MeshBuilder, VideoTexture, PointsCloudSystem, CloudPoint, PointColor, Vector3, StandardMaterial, FluidRenderer, Color3 } from "@babylonjs/core"
import { generateRangeMapper, randomInRange } from "../../utility"
import { SceneContextType } from "../types"

export const onConnectionEvent = (context: SceneContextType) => {
  const { scene, comm, audioAnalyzer, peers, GUI } = context

  return async (pc: RTCPeerConnection) => {
    const peerId = comm.getPeerId(pc)
    const peerObjects = []

    if (!peerId) return
    const peerVideo = comm.videos.get(peerId)

    if (!peerVideo) return

    const { videoHeight, videoWidth } = peerVideo
    const webcamTexture = new VideoTexture('webcam', peerVideo, scene)

    const plane = MeshBuilder.CreatePlane(`baseMesh-${peerId}`, {
      height: videoHeight,
      width: videoWidth,
    }, scene);

    plane.setPositionWithLocalVector(new Vector3(randomInRange(-1,1), randomInRange(1,2), randomInRange(0,6)))
    plane.billboardMode = 7
    peerObjects.push(plane)

    const particleCloud = new PointsCloudSystem('pcs', 1, scene)
    peerObjects.push(particleCloud)

    // Somehow only works like this, using UV and index 1
    particleCloud.addSurfacePoints(plane, 10000, PointColor.UV, 1)
    const particleMesh = await particleCloud.buildMeshAsync()
    particleMesh.position = plane.position
    peerObjects.push(particleMesh)

    for (const particle of particleCloud.particles) {
      (particle as CloudPoint & { initialPos: Vector3 }).initialPos = particle.position.clone()
    }

    if (particleMesh.material) {
      (particleMesh.material as StandardMaterial).emissiveTexture = webcamTexture
      particleMesh.material.pointSize = 5
    }

    particleCloud.recycleParticle = function(particle) {
      particle.position = (particle as CloudPoint & { initialPos: Vector3 }).initialPos.clone()

      return particle
    }

    // let t = 0
    // GUI.paramSlider.onValueChangedObservable.add((evData) => {
    //   t = evData
    // })

    const audioAnalyzerBufferSize = audioAnalyzer.analyzer?.frequencyBinCount || 0
    const audioDataArray = new Uint8Array(audioAnalyzerBufferSize)

    const paramMapper1 = generateRangeMapper(0, 255, 0, 10)
    const paramMapper2 = generateRangeMapper(0, 255, 0, 20)

    const peerSeed = randomInRange(0, 100)

    particleCloud.updateParticle = function(particle) {
      let p = particle as CloudPoint & { initialPos: Vector3 }

      if (p.position.lengthSquared() > 1.5) this.recycleParticle(p)

      audioAnalyzer.analyzer?.getByteFrequencyData(audioDataArray)
      let t1 = paramMapper1(audioDataArray[24])
      let t2 = paramMapper2(audioDataArray[24])
      // GUI.debugLabel.text = String(t2)

      this.counter += (scene.deltaTime / 1000)
      const period = 100000
      const theta = Math.cos(this.counter * Math.PI * 2 * (1 / (period * 2)))

      let amp: number
      if (peerSeed >= 50) {
        amp = 0.08 * Math.sin(this.counter * -(p.position.y ** 2 + p.position.x ** 2) * Math.PI * 2 * (1 / (period * 2))) * t1 * 4
        p.position.z = amp * theta
      } else {
        amp = 0.1 * Math.sin(t2 * (p.position.x + particleMesh.edgesWidth / 2))
        p.position.x = p.initialPos.x + amp * theta
      }

      return p
    }

    // const fluidRenderer = ((scene as any).enableFluidRenderer() as FluidRenderer)
    // const fluidRenderObj = fluidRenderer.addCustomParticles({
    //   position: particleCloud.positions,
    // }, particleCloud.positions.length / 3, false, undefined, scene.activeCamera ?? undefined)

    // fluidRenderObj.targetRenderer.fluidColor = new Color3(1,1,1)

    const beforeRender = () => {
      particleCloud.setParticles()

      // fluidRenderObj.object.vertexBuffers['position'].updateDirectly(particleCloud.positions, 0)
    }

    scene.registerBeforeRender(beforeRender);

    plane.dispose();

    peers.set(peerId, { video: peerVideo, objects: peerObjects, beforeRender })
  }
}

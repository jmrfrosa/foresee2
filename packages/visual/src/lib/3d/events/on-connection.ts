import { MeshBuilder, VideoTexture, PointsCloudSystem, CloudPoint, PointColor, Vector3, StandardMaterial } from "@babylonjs/core"
import { SceneContextType } from "../types"

const audioAnalyzerFreqBinRangeStart = 0
const audioAnalyzerFreqBinRangeEnd = 255
const audioAnalyzerOutputRangeStart = 0
const audioAnalyzerOutputRangeEnd = 10
const rangeSlope =
  (audioAnalyzerOutputRangeEnd - audioAnalyzerOutputRangeStart) / (audioAnalyzerFreqBinRangeEnd - audioAnalyzerFreqBinRangeStart)

function mapToAudioAnalyzerOutputRange(input: number) {
  return audioAnalyzerOutputRangeStart + rangeSlope * (input - audioAnalyzerFreqBinRangeStart)
}

export const onConnectionEvent = (context: SceneContextType) => {
  const { scene, comm, audioAnalyzer, peers, GUI } = context

  return async (pc: RTCPeerConnection) => {
    const peerId = comm.getPeerId(pc)

    if (!peerId) return
    const peerVideo = comm.videos.get(peerId)

    if (!peerVideo) return

    const { videoHeight, videoWidth } = peerVideo
    const webcamTexture = new VideoTexture('webcam', peerVideo, scene)

    const plane = MeshBuilder.CreatePlane(`baseMesh-${peerId}`, {
      height: videoHeight,
      width: videoWidth,
    }, scene);

    const particleCloud = new PointsCloudSystem('pcs', 1, scene)

    // Somehow only works like this, using UV and index 1
    particleCloud.addSurfacePoints(plane, 10000, PointColor.UV, 1)
    const particleMesh = await particleCloud.buildMeshAsync()

    for (const particle of particleCloud.particles) {
      (particle as CloudPoint & { initialPos: Vector3 }).initialPos = particle.position.clone()
    }

    if (particleMesh.material) {
      (particleMesh.material as StandardMaterial).emissiveTexture = webcamTexture
      particleMesh.material.pointSize = 5
    }

    particleCloud.recycleParticle = function(particle) {
      particle.position = (particle as CloudPoint & { initialPos: Vector3 }).initialPos

      return particle
    }

    let t = 0
    // GUI.paramSlider.onValueChangedObservable.add((evData) => {
    //   t = evData
    // })

    const audioAnalyzerBufferSize = audioAnalyzer.analyzer?.frequencyBinCount || 0
    const audioDataArray = new Uint8Array(audioAnalyzerBufferSize)

    particleCloud.updateParticle = function(particle) {
      audioAnalyzer.analyzer?.getByteFrequencyData(audioDataArray)
      t = mapToAudioAnalyzerOutputRange(audioDataArray[24])
      GUI.debugLabel.text = String(t)

      if (particle.position.lengthSquared() > 1) this.recycleParticle(particle)

      this.counter += (scene.deltaTime / 1000)
      const period = 100000
      const theta = Math.cos(this.counter * Math.PI * 2 * (1 / (period * 2)))
      // const ampZ = 0.08 * Math.sin(this.counter * Math.sqrt(particle.position.y ** 2 + particle.position.x ** 2) * Math.PI * 2 * (1 / (period * 2)))
      const ampZ = 0.08 * Math.sin(this.counter * -(particle.position.y ** 2 + particle.position.x ** 2) * Math.PI * 2 * (1 / (period * 2))) * t * 4
      // const ampY = 0.01 * Math.sin(this.counter * Math.sqrt(particle.position.z ** 2 + particle.position.x ** 2) * Math.PI * 2 * (1 / (period * 2)))
      // const ampX = 0.08 * Math.cos(this.counter * -(particle.position.z ** 2 + particle.position.y ** 2) * Math.PI * 2 * (1 / (period * 2)) * t)
      // particle.position.y = particle.position.y / (1 - ampY * theta)
      // particle.position.x = particle.position.x / (1 + ampX * theta)
      // particle.position.x += ampX * theta * 0.1
      particle.position.z = ampZ * theta

      return particle
    }

    scene.registerBeforeRender(() => {
      particleCloud.setParticles()
    });

    plane.dispose();

    peers.set(peerId, { video: peerVideo, mesh: plane })
  }
}

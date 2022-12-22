import { MeshBuilder, VideoTexture, Vector3 } from "@babylonjs/core"
import { randomInRange } from "../../utility"
import { ParticleCloudGenerator } from "../generators/particle-cloud.generator"
import { SceneContextType } from "../types"

export const onConnectionEvent = (context: SceneContextType) => {
  const { scene, comm, peers } = context

  return async (pc: RTCPeerConnection) => {
    const peerId = comm.getPeerId(pc)
    let peerObjects = []

    if (!peerId) return
    const peerVideo = comm.videos.get(peerId)

    if (!peerVideo) return

    const { videoHeight, videoWidth } = peerVideo
    const webcamTexture = new VideoTexture('webcam', peerVideo, scene)

    const peerSeed = generatePeerSeed()

    const plane = MeshBuilder.CreatePlane(`baseMesh-${peerId}`, {
      height: videoHeight,
      width: videoWidth,
    }, scene);

    plane.setPositionWithLocalVector(new Vector3(randomInRange(-1,1), randomInRange(1,2), randomInRange(0,6)))
    plane.billboardMode = 7
    peerObjects.push(plane)

    const transformMeshIntoParticleCloud = new ParticleCloudGenerator(plane, context, { peerObjects, peerSeed, webcamTexture })
    const { beforeRender, objects } = await transformMeshIntoParticleCloud.generate()

    peers.set(peerId, { video: peerVideo, objects, beforeRender })
  }
}

const generatePeerSeed = () => randomInRange(0, 100)

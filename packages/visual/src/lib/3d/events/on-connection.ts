import { MeshBuilder, VideoTexture, Vector3 } from "@babylonjs/core"
import { randomInRange } from "../../utility"
import { MorphingMeshGenerator } from "../generators/morphing-mesh.generator"
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

    // const plane = MeshBuilder.CreatePlane(`baseMesh-${peerId}`, {
    //   height: videoHeight,
    //   width: videoWidth,
    //   updatable: true
    // }, scene);

    const box = MeshBuilder.CreateBox(`baseMesh-${peerId}`, {
      height: videoHeight,
      width: videoWidth,
      updatable: true
    }, scene)

    box.setPositionWithLocalVector(new Vector3(randomInRange(-1,1), randomInRange(1,2), randomInRange(0,6)))
    // plane.billboardMode = 7
    peerObjects.push(box)

    const extraData = { peerObjects, peerSeed, webcamTexture, peerId }

    // const transformMeshIntoParticleCloud = new ParticleCloudGenerator(plane, context, extraData)
    // const { beforeRender, objects } = await transformMeshIntoParticleCloud.generate()

    const morphMesh = new MorphingMeshGenerator(box, context, extraData)
    const { beforeRender } = morphMesh.generate()

    peers.set(peerId, { video: peerVideo, objects: peerObjects, beforeRender })
  }
}

const generatePeerSeed = () => randomInRange(0, 100)

import { MeshBuilder, VideoTexture, Vector3, GlowLayer, PointLight } from "@babylonjs/core"
import { WaterMaterial } from "@babylonjs/materials"
import { randomInRange } from "../../utility"
import { MorphingMeshGenerator } from "../generators/morphing-mesh.generator"
// import { ParticleCloudGenerator } from "../generators/particle-cloud.generator"
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

    const mesh = MeshBuilder.CreatePlane(`baseMesh-${peerId}`, {
      height: videoHeight,
      width: videoWidth,
      updatable: true
    }, scene);

    // const mesh = MeshBuilder.CreateBox(`baseMesh-${peerId}`, {
    //   height: videoHeight,
    //   width: videoWidth,
    //   updatable: true
    // }, scene)

    mesh.setPositionWithLocalVector(new Vector3(randomInRange(-1,1), randomInRange(1,2), randomInRange(0,6)))
    mesh.billboardMode = 7
    peerObjects.push(mesh)

    const extraData = { peerObjects, peerSeed, webcamTexture, peerId }

    // const transformMeshIntoParticleCloud = new ParticleCloudGenerator(plane, context, extraData)
    // const { beforeRender, objects } = await transformMeshIntoParticleCloud.generate()

    const light = new PointLight(`light-${peerId}`, mesh.position, scene)
    light.parent = mesh

    const morphMesh = new MorphingMeshGenerator(mesh, context, extraData)
    const { beforeRender } = morphMesh.generate();

    (scene.getMaterialByName('waterMaterial') as WaterMaterial).addToRenderList(mesh);
    (scene.getGlowLayerByName('meshGlowLayer') as GlowLayer).referenceMeshToUseItsOwnMaterial(mesh)

    peers.set(peerId, { video: peerVideo, objects: peerObjects, beforeRender })
  }
}

const generatePeerSeed = () => randomInRange(0, 100)

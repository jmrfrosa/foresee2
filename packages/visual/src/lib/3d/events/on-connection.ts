import { MeshBuilder, VideoTexture, Vector3, GlowLayer, PointLight, Texture, Camera } from "@babylonjs/core"
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

    // const { videoHeight, videoWidth } = peerVideo
    const webcamTexture = new VideoTexture('webcam', peerVideo, scene)

    const peerSeed = generatePeerSeed()

    const mesh = createPeerMesh(webcamTexture, peerId, context)
    peerObjects.push(mesh)

    const extraData = { peerObjects, peerSeed, webcamTexture, peerId }

    // const transformMeshIntoParticleCloud = new ParticleCloudGenerator(plane, context, extraData)
    // const { beforeRender, objects } = await transformMeshIntoParticleCloud.generate()

    // const light = new PointLight(`light-${peerId}`, mesh.position, scene)
    // light.parent = mesh

    const morphMesh = new MorphingMeshGenerator(mesh, context, extraData)
    const { beforeRender } = morphMesh.generate();

    (scene.getMaterialByName('waterMaterial') as WaterMaterial).addToRenderList(mesh);
    (scene.getGlowLayerByName('meshGlowLayer') as GlowLayer).referenceMeshToUseItsOwnMaterial(mesh)

    peers.set(peerId, { video: peerVideo, objects: peerObjects, beforeRender })
  }
}

const generatePeerSeed = () => randomInRange(0, 100)

export const createPeerMesh = (texture: Texture, uniqueId: string, context: SceneContextType) => {
  const { meshDeformParams } = context.externalParams
  const cameraPos = (context.scene.activeCamera as Camera).position

  const mesh = MeshBuilder.CreatePlane(`peerMesh-${uniqueId}`, {
    height: texture.uScale,
    width: texture.vScale,
    updatable: true
  }, context.scene)

  const meshAngle = randomInRange(0, Math.PI)

  const xPos = (cameraPos.x + meshDeformParams.webcamRadius) * Math.cos(meshAngle)
  const yPos = randomInRange(1, cameraPos.y + meshDeformParams.yWebcamRange)
  const zPos = (cameraPos.z + meshDeformParams.webcamRadius) * Math.sin(meshAngle)

  mesh.setPositionWithLocalVector(new Vector3(xPos, yPos,zPos))
  mesh.parent = context.scene.activeCamera
  mesh.billboardMode = 7

  return mesh
}

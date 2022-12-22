import { Mesh, VideoTexture } from "@babylonjs/core"
import { SceneContextType } from "../types"

interface GeneratorInterface {
  peerObjects: unknown[]
  webcamTexture: VideoTexture
  peerSeed: number
  peerId: string
}

export abstract class BaseTransformGenerator {
  baseMesh: Mesh
  context: SceneContextType
  extra: GeneratorInterface

  constructor(baseMesh: Mesh, context: SceneContextType, extra: GeneratorInterface) {
    this.baseMesh = baseMesh
    this.context = context
    this.extra = extra
  }

  abstract generate(): Record<string, unknown> | Promise<Record<string, unknown>>
}

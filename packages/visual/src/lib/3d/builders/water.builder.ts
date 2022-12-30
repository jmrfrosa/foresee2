import { Color3, Mesh, MeshBuilder, Texture } from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";
import { BaseBuilder } from "./base.builder";

export class WaterBuilder extends BaseBuilder {
  baseMesh?: Mesh
  material?: WaterMaterial
  texture?: Texture

  build(skyMesh?: Mesh) {
    this.baseMesh = MeshBuilder.CreateGround('water', { width: 1000, height: 1000 }, this.context.scene)
    this.material = new WaterMaterial('waterMaterial', this.context.scene)
    this.texture = this.context.scene.getTextureByName('./textures/water/waterbump.png') as Texture

    this.material.bumpTexture = this.texture

    this.material.waterColor = new Color3(0.0, 0.0, 0.1)
    this.material.bumpHeight *= 5
    this.material.windForce = 0.5
    this.material.waveHeight = 0.3

    if(skyMesh)
      this.material.addToRenderList(skyMesh)

    this.baseMesh.material = this.material

    // const beatScoreRange = 5
    // const beatScoreStart = 0
    // const beatScoreEnd = beatScoreStart + beatScoreRange
    // this.context.scene.registerBeforeRender(() => {

    //   const beatScoreSum = this.context.audioAnalyzer.audioData?.subarray(beatScoreStart, beatScoreEnd)?.reduce((sum, n) => sum + n)
    //   const beatScore = beatScoreSum && (beatScoreSum / beatScoreRange) || 0
    //   waterMaterial.bumpHeight = Math.cos(beatScore * 0.4) * 2
    // })
  }

  addMeshReflection(mesh?: Mesh) {
    if (!this.material || !mesh) return

    this.material.addToRenderList(mesh)
  }
}

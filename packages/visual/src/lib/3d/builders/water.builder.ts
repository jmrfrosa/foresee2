import { Color3, Mesh, MeshBuilder, Texture } from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";
import { BaseBuilder } from "./base.builder";

export class WaterBuilder extends BaseBuilder {
  build(skyMesh?: Mesh) {
    const waterMesh = MeshBuilder.CreateGround('water', { width: 1000, height: 1000 }, this.context.scene)
    const waterMaterial = new WaterMaterial('waterMaterial', this.context.scene)
    const waterTexture = this.context.scene.getTextureByName('./textures/water/waterbump.png') as Texture
    waterTexture.scale(10)
    waterMaterial.bumpTexture = waterTexture

    waterMaterial.waterColor = new Color3(0.0, 0.0, 0.1)
    waterMaterial.bumpHeight *= 5
    waterMaterial.windForce = 0.5
    waterMaterial.waveHeight = 0.3

    if(skyMesh)
      waterMaterial.addToRenderList(skyMesh)

    waterMesh.material = waterMaterial

    // const beatScoreRange = 5
    // const beatScoreStart = 0
    // const beatScoreEnd = beatScoreStart + beatScoreRange
    // this.context.scene.registerBeforeRender(() => {

    //   const beatScoreSum = this.context.audioAnalyzer.audioData?.subarray(beatScoreStart, beatScoreEnd)?.reduce((sum, n) => sum + n)
    //   const beatScore = beatScoreSum && (beatScoreSum / beatScoreRange) || 0
    //   waterMaterial.bumpHeight = Math.cos(beatScore * 0.4) * 2
    // })
  }
}

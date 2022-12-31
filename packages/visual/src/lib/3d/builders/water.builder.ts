import { Color3, Mesh, MeshBuilder, Texture } from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";
import { BaseBuilder } from "./base.builder";

export class WaterBuilder extends BaseBuilder {
  baseMesh?: Mesh
  material?: WaterMaterial
  texture?: Texture

  build(skyMesh?: Mesh) {
    this.baseMesh = MeshBuilder.CreateGround('water', { width: 1000, height: 1000 }, this.context.scene)
    this.baseMesh.position.y = -10

    this.material = new WaterMaterial('waterMaterial', this.context.scene)
    this.texture = this.context.scene.getTextureByName('./textures/water/waterbump.png') as Texture

    this.material.bumpTexture = this.texture

    this.material.waterColor = new Color3(0.0, 0.0, 0.1)
    this.material.bumpHeight *= 5
    this.material.windForce = 0.5
    this.material.waveHeight = 0.0
    this.material.waveLength = 0.01

    if(skyMesh)
      this.material.addToRenderList(skyMesh)

    this.baseMesh.material = this.material

    const beforeRender = () => {
      const { externalParams: { meshDeformParams } } = this.context
      const mat = this.material as WaterMaterial
      const fftIntensity = this.context.audioAnalyzer.averageInRange([
        meshDeformParams.waterBeatRangeStart,
        meshDeformParams.waterBeatRangeEnd
      ]) * meshDeformParams.waterBeatDeformIntensity

      mat.bumpHeight = Math.cos(fftIntensity * 0.4) * 2
      mat.windForce = Math.cos(fftIntensity * 0.4) * 2 + meshDeformParams.waterWindIntensity
      mat.waveSpeed = Math.cos(fftIntensity * 0.4) * 2 + meshDeformParams.waterWaveSpeed
      mat.waveHeight = Math.cos(fftIntensity * 0.4) * 2 + meshDeformParams.waterWaveSpeed
      mat.waveCount = meshDeformParams.waterWaveCount
      mat.waveLength = meshDeformParams.waterWaveLength
    }

    this.context.scene.registerBeforeRender(beforeRender)
  }

  addMeshReflection(mesh?: Mesh) {
    if (!this.material || !mesh) return

    this.material.addToRenderList(mesh)
  }
}

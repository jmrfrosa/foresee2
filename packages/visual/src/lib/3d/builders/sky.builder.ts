import { Mesh, MeshBuilder, ShaderMaterial, Texture } from "@babylonjs/core";
import { SkyMaterial } from "@babylonjs/materials";
import { BaseBuilder } from "./base.builder";

export class SkyBuilder extends BaseBuilder {
  buildGenerative() {
    const skyGeneratorShaderMaterial = new ShaderMaterial("skyShader", this.context.scene, './shaders/scenery/sky/sky', {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
        samplers: ['iChannel0']
    })

    const skyTexture = new Texture("http://i.imgur.com/kUJBvin.png", this.context.scene, false , false)
    skyTexture.anisotropicFilteringLevel = 1

    const skyDomeMesh = MeshBuilder.CreateSphere('skyDome', { segments: 500, diameter: 500 }, this.context.scene)

    skyTexture.onLoadObservable.add((texture) => {
      //https://www.shadertoy.com/view/ltlSWB
      skyGeneratorShaderMaterial.setTexture("iChannel0", texture);
      skyGeneratorShaderMaterial.setFloat('offset', 10);
      skyGeneratorShaderMaterial.backFaceCulling = false;

      skyDomeMesh.material = skyGeneratorShaderMaterial

      let time = 0
      this.context.scene.registerBeforeRender(() => {
        skyGeneratorShaderMaterial.setFloat('time', time * this.context.externalParams.sceneParams.timeFactor)
        skyGeneratorShaderMaterial.setFloat('suny', Math.sin(time * 0.00001) * this.context.externalParams.sceneParams.timeFactor)
        skyGeneratorShaderMaterial.setFloat('sunx', Math.sin(time * 0.00001) * this.context.externalParams.sceneParams.timeFactor)

        time += this.context.scene.deltaTime
      })
    })

    return { skyBox: skyDomeMesh }
  }

  buildStatic() {
    // const sun = new PointLight("skyStaticSun", new Vector3(60, 500, 10), this.context.scene)

    const skyBox = MeshBuilder.CreateBox('skyStaticBox', { size: 1000 }, this.context.scene)
    const skyMaterial = new SkyMaterial('skyStaticMaterial', this.context.scene)
    skyMaterial.backFaceCulling = false
    skyMaterial.useSunPosition = true

    skyBox.material = skyMaterial

    let time = 0
    this.context.scene.registerBeforeRender(() => {
      // skyMaterial.inclination = Math.cos(time * 0.0005) * 0.5
      skyMaterial.sunPosition.x = Math.cos(time * 0.0001) * 100
      skyMaterial.sunPosition.z = Math.cos(time * 0.0001) * 100

      time += this.context.scene.deltaTime
    })

    return { skyBox }
  }
}

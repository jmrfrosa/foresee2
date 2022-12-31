import { MeshBuilder, ShaderMaterial, Texture } from "@babylonjs/core";
import { SkyMaterial } from "@babylonjs/materials";
import { amplitudeMap } from "../../utility";
import { BaseBuilder } from "./base.builder";

export enum SkyboxTypes {
  SIMPLE = 'simple',
  COMPLEX = 'complex'
}

export class SkyBuilder extends BaseBuilder {
  currentSkyboxType?: SkyboxTypes
  disposables: Array<{ dispose: () => void }> = []
  beforeRenders: Array<() => void> = []

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
      const beforeRender = () => {
        const t = time * this.context.externalParams.sceneParams.timeFactor

        skyGeneratorShaderMaterial.setFloat('time', t)
        skyGeneratorShaderMaterial.setFloat('suny', Math.sin(t * 0.00001))
        skyGeneratorShaderMaterial.setFloat('sunx', Math.sin(t * 0.00001))
        skyGeneratorShaderMaterial.setInt('steps', this.context.externalParams.sceneParams.skyboxRenderStepsMain)
        skyGeneratorShaderMaterial.setInt('stepss', this.context.externalParams.sceneParams.skyboxRenderStepsSecondary)
        skyGeneratorShaderMaterial.setFloat('height', this.context.externalParams.sceneParams.skyboxHeight)
        skyGeneratorShaderMaterial.setFloat('cloudy', this.context.externalParams.sceneParams.skyboxCloudFactor)
        skyGeneratorShaderMaterial.setFloat('haze', this.context.externalParams.sceneParams.skyboxHaze)
        skyGeneratorShaderMaterial.setFloat('startreshold', this.context.externalParams.sceneParams.skyboxStarTreshold)

        time += this.context.scene.deltaTime
      }

      this.context.scene.registerBeforeRender(beforeRender)

      this.disposables.push(...[skyDomeMesh, skyGeneratorShaderMaterial, skyTexture])
      this.beforeRenders.push(beforeRender)
    })

    this.currentSkyboxType = SkyboxTypes.COMPLEX

    return { skyBox: skyDomeMesh }
  }

  buildStatic() {
    // const sun = new PointLight("skyStaticSun", new Vector3(60, 500, 10), this.context.scene)

    const skyBox = MeshBuilder.CreateBox('skyStaticBox', { size: 1000 }, this.context.scene)
    const skyMaterial = new SkyMaterial('skyStaticMaterial', this.context.scene)
    skyMaterial.backFaceCulling = false
    // skyMaterial.useSunPosition = true

    skyBox.material = skyMaterial

    let time = 0
    const inclinationMapper = amplitudeMap([-0.5, 0.2])
    const azimuthMapper = amplitudeMap([0, 0.33])
    const beforeRender = () => {
      const t = time * this.context.externalParams.sceneParams.timeFactor

      skyMaterial.inclination = inclinationMapper(Math.cos(t * 0.00001))
      skyMaterial.azimuth = azimuthMapper(Math.sin(t * 0.00001))
      // skyMaterial.sunPosition.x = Math.cos(t * 0.0001) * 100
      // skyMaterial.sunPosition.z = Math.cos(t * 0.0001) * 100

      time += this.context.scene.deltaTime
    }

    this.context.scene.registerBeforeRender(beforeRender)

    this.currentSkyboxType = SkyboxTypes.SIMPLE
    this.disposables.push(...[skyBox, skyMaterial])
    this.beforeRenders.push(beforeRender)

    return { skyBox }
  }

  disposeCurrent() {
    this.currentSkyboxType = undefined
    this.disposables.forEach((d) => {
      try {
        d.dispose()
      } catch (err) {
        console.error('%o is not disposable, %o', d, err)
      }
    })
    this.beforeRenders.forEach((br) => {
      this.context.scene.unregisterBeforeRender(br)
    })

    this.disposables = []
    this.beforeRenders = []
  }

  build(skyboxType: SkyboxTypes) {
    this.disposeCurrent()

    switch(skyboxType) {
      case SkyboxTypes.SIMPLE:
        return this.buildStatic()
      case SkyboxTypes.COMPLEX:
        return this.buildGenerative()
      default:
        throw('Invalid skybox type')
    }
  }
}

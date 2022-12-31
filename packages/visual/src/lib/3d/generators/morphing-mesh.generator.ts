import { Engine, RawTexture, ShaderMaterial, Vector3 } from "@babylonjs/core";
import { BaseTransformGenerator } from "./base.generator";

export class MorphingMeshGenerator extends BaseTransformGenerator {
  generate() {
    const { externalParams: { meshDeformParams, sceneParams } } = this.context
    const audioDataTexture = this.buildAudioTexture()
    const webcamShaderMaterial = this.buildWebcamShader(audioDataTexture)

    this.baseMesh.material = webcamShaderMaterial
    const initialMeshPos = this.baseMesh.position.clone()

    let time = 0
    const beforeRender = () => {
      time += this.context.scene.deltaTime

      webcamShaderMaterial.setFloat("time", time * sceneParams.timeFactor)
      webcamShaderMaterial.setFloat("xVertexDeformIntensity", meshDeformParams.xVertexDeformIntensity)
      webcamShaderMaterial.setFloat("yVertexDeformIntensity", meshDeformParams.yVertexDeformIntensity)
      webcamShaderMaterial.setFloat("zVertexDeformIntensity", meshDeformParams.zVertexDeformIntensity)
      webcamShaderMaterial.setFloat("offsetModulatorIntensity", meshDeformParams.offsetModulatorIntensity)
      webcamShaderMaterial.setFloat("offsetShakerIntensity", meshDeformParams.offsetShakerIntensity)
      webcamShaderMaterial.setVector3("cameraPosition", this.context.scene.activeCamera?.position ?? Vector3.Zero())
      audioDataTexture.update(this.context.audioAnalyzer.audioData as Uint8Array)

      this.baseMesh.scaling.x = meshDeformParams.webcamScale
      this.baseMesh.scaling.y = meshDeformParams.webcamScale
      this.baseMesh.scaling.z = meshDeformParams.webcamScale
      this.baseMesh.position.x = initialMeshPos.x + meshDeformParams.xWebcamOffset
      this.baseMesh.position.y = initialMeshPos.y + meshDeformParams.yWebcamOffset
      this.baseMesh.position.z = initialMeshPos.z + meshDeformParams.zWebcamOffset
    }

    this.context.scene.registerBeforeRender(beforeRender)

    return { beforeRender }
  }

  private buildWebcamShader(audioDataTexture: RawTexture) {
    const webcamShaderMaterial = new ShaderMaterial(`webcamShaderMaterial-${this.extra.peerId}`, this.context.scene, './shaders/sorting', {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
      samplers: ['webcamTexture', 'audioSampler'],
    })

    webcamShaderMaterial.setTexture('webcamTexture', this.extra.webcamTexture)
    webcamShaderMaterial.setTexture('audioSampler', audioDataTexture)
    webcamShaderMaterial.setFloat("time", 0)
    webcamShaderMaterial.setVector3("cameraPosition", Vector3.Zero())

    webcamShaderMaterial.backFaceCulling = false

    return webcamShaderMaterial
  }

  private buildAudioTexture() {
    // Ensuring analyzer is all set
    this.context.audioAnalyzer.startAnalysis()
    this.context.audioAnalyzer.sampleByteFrequency()

    const audioDataWidth = (this.context.audioAnalyzer.analyzer as AnalyserNode).frequencyBinCount
    const audioDataTexture = new RawTexture(this.context.audioAnalyzer.audioData ?? null, audioDataWidth, 1, Engine.TEXTUREFORMAT_LUMINANCE, this.context.scene)

    return audioDataTexture
  }
}

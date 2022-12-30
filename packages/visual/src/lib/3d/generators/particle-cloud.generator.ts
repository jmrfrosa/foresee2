import { CloudPoint, PointColor, PointsCloudSystem, StandardMaterial, Vector3 } from "@babylonjs/core";
import { generateRangeMapper } from "../../utility";
import { BaseTransformGenerator } from "./base.generator";

type CustomCloudPoint = CloudPoint & { initialPos: Vector3 }

export class ParticleCloudGenerator extends BaseTransformGenerator {
  async generate() {
    const { peerObjects: objects, webcamTexture, peerSeed } = this.extra
    const dt = this.context.scene.deltaTime

    const particleCloud = new PointsCloudSystem('pcs', 1, this.context.scene)
    objects.push(particleCloud)

    // Somehow only works like this, using UV and index 1
    particleCloud.addSurfacePoints(this.baseMesh, 10000, PointColor.UV, 1)

    // We enhance particles with extra data about their original position. This will be available later.
    for (const particle of particleCloud.particles) {
      (particle as CustomCloudPoint).initialPos = particle.position.clone()
    }

    const particleMesh = await particleCloud.buildMeshAsync()
    particleMesh.position = this.baseMesh.position
    objects.push(particleMesh)

    if (particleMesh.material) {
      (particleMesh.material as StandardMaterial).emissiveTexture = webcamTexture
      particleMesh.material.pointSize = 5
    }

    particleCloud.recycleParticle = function(particle) {
      particle.position = (particle as CloudPoint & { initialPos: Vector3 }).initialPos.clone()

      return particle
    }

    const paramMapper1 = generateRangeMapper(0, 255, 0, 10)
    const paramMapper2 = generateRangeMapper(0, 255, 0, 20)

    // Must be inside `function` to grant access to internal `this`
    const extCtx = this
    particleCloud.updateParticle = function(particle) {
      let p = particle as CustomCloudPoint
      if (!extCtx.context.audioAnalyzer.audioData) return p

      if (p.position.lengthSquared() > 3) this.recycleParticle(p)

      // |  Calling `sampleByteFrequency` is not necessary
      // |  here if we're already calling it elsewhere, e.g.
      // |  in the main page visualizer.
      // V
      // extCtx.context.audioAnalyzer.sampleByteFrequency()
      let t1 = paramMapper1(extCtx.context.audioAnalyzer.audioData[24])
      let t2 = paramMapper2(extCtx.context.audioAnalyzer.audioData[24])

      // Debug
      // extCtx.context.GUI.debugLabel.text = String(t2)

      this.counter += (dt / 1000)
      const period = 100000
      const theta = Math.cos(this.counter * Math.PI * 2 * (1 / (period * 2)))

      let amp: number
      if (peerSeed >= 50) {
        amp = 0.08 * Math.sin(this.counter * -(p.position.y ** 2 + p.position.x ** 2) * Math.PI * 2 * (1 / (period * 2))) * t1 * 4
        p.position.z = amp * theta
      } else {
        amp = 0.1 * Math.sin(t2 * (p.position.x + particleMesh.edgesWidth / 2))
        p.position.x = p.initialPos.x + amp * theta
      }

      return p
    }

    const beforeRender = () => {
      particleCloud.setParticles()
    }

    this.context.scene.registerBeforeRender(beforeRender);

    this.baseMesh.dispose();

    return {
      objects, beforeRender
    }
  }
}

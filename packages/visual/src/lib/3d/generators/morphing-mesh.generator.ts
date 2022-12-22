import { StandardMaterial } from "@babylonjs/core";
import { BaseTransformGenerator } from "./base.generator";

export class MorphingMeshGenerator extends BaseTransformGenerator {
  generate() {
    const webcamMaterial = new StandardMaterial(`webcamMaterial-${this.extra.peerId}`, this.context.scene)
    webcamMaterial.diffuseTexture = this.extra.webcamTexture

    this.baseMesh.material = webcamMaterial

    const initialPos = this.baseMesh.getPositionData()?.slice(0)
    if (!initialPos) throw('No position data for mesh')

    let time = 0
    const beforeRender = () => {
      this.baseMesh.updateMeshPositions((positions) => {
        for (var idx = 0; idx < positions.length; idx += 3) {
          const x = idx
          const y = idx + 1
          const z = idx + 2

          // positions[x] = Math.sin(positions[x] / 1000)
          // positions[y] = Math.sin(positions[y] / 100)
          const transform = initialPos[x] + Math.sin(time * 0.0001 * positions[x])
          this.context.GUI.debugLabel.text = String(transform)
          positions[x] = transform
        }
      }, true)

      time += this.context.scene.deltaTime
    }

    this.context.scene.registerBeforeRender(beforeRender)

    return { beforeRender }
  }
}

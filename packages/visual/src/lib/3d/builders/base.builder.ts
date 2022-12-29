import { SceneContextType } from "../types";

export abstract class BaseBuilder {
  context: SceneContextType

  constructor(context: SceneContextType) {
    this.context = context
  }
}

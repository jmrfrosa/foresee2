import { SceneContextType } from "../types";

export const onDisconnectionEvent = (context: SceneContextType) => {
  const { comm, peers, scene } = context

  return async (pc: RTCPeerConnection) => {
    const peerId = comm.getPeerId(pc)

    if (!peerId) return

    const p = peers.get(peerId)
    if (p) {
      console.log('Disposing!')

      p.beforeRender && scene.unregisterBeforeRender(p.beforeRender)

      p.objects.forEach((o) => {
        if (o && typeof o === 'object' && 'dispose' in o && typeof o.dispose === 'function') {
          o.dispose()
        }

        o = null
      })

      peers.delete(peerId)
    }
  }
}

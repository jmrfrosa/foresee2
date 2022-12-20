import { SceneContextType } from "../types";

export const onDisconnectionEvent = (context: SceneContextType) => {
  const { comm, peers } = context

  return async (pc: RTCPeerConnection) => {
    const peerId = comm.getPeerId(pc)

    if (!peerId) return

    const p = peers.get(peerId)
    if (p) {
      console.log('Disposing!')
      p.mesh.dispose()
      peers.delete(peerId)
    }
  }
}

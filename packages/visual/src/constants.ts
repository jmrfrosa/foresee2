export const RELAY_URL = import.meta.env.VITE_RELAY_URL
export const ICE_CONFIG = { iceServers: [
  {
    urls: 'stun:stun.stunprotocol.org:3478',
  },
  {
    urls: 'stun:stun.labs.net:3478',
  },
  {
    urls: 'turn:openrelay.metered.ca:80',
    credential: 'openrelayserver',
    username: 'openrelayserver',
  }
]}

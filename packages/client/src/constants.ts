export const RELAY_URL = import.meta.env.VITE_RELAY_URL
export const ICE_CONFIG = { iceServers: [
  {
    urls: 'stun:stun.stunprotocol.org:3478',
  },
  {
    urls: 'stun:stun.labs.net:3478',
  },
  {
    urls: ['turn:relay.metered.ca:80', 'turn:relay.metered.ca:443'],
    username: import.meta.env.VITE_OPEN_RELAY_USERNAME,
    credential: import.meta.env.VITE_OPEN_RELAY_PASSWORD,
  }
]}

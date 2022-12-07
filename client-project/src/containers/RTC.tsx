import { useEffect, useState } from 'preact/hooks'
import { RTCConnector } from '../lib/rtc-connector'

export const RTC = () => {
  const [relayUrl, setRelayUrl] = useState<string>('')
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([])
  const [videoDevice, setVideoDevice] = useState<string | undefined>()
  const [connector, setConnector] = useState<RTCConnector | undefined>()

  useEffect(() => {
    const fetchDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices()

      setDeviceList(devices)
    }

    fetchDevices()
  }, [])

  const handleJoin = async () => {
    console.log('Attempting to join!', { relayUrl, videoDevice })

    setConnector(await RTCConnector.initialize(relayUrl, videoDevice))
  }

  const addTrack = () => {
    if (!connector) return

    connector.assignMedia(videoDevice)
  }

  return (
    <>
      <input type="text" value={relayUrl} onChange={(e) => setRelayUrl(e.currentTarget.value)} />
      <select value={videoDevice} onChange={(e) => setVideoDevice(e.currentTarget.value)}>
        {deviceList.map(device => {
          return (
            <option value={device.deviceId}>{device.label}</option>
          )
        })}
      </select>
      <button type="button" onClick={handleJoin}>Join</button>
      <button type="button" onClick={addTrack} disabled={!connector}>Add track</button>
      <br />
      ID: {connector?.sessionId}
      <br />
      Status: {connector?.pc.connectionState}
    </>
  )
}

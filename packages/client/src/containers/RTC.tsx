import { useEffect, useRef, useState } from 'preact/hooks'
import { JSXInternal } from 'preact/src/jsx'
import { useMediaStream } from '../hooks/useMediaStream'
import { useRTC } from '../hooks/useRTC'
import { MediaSelector } from './MediaSelector'

export const RTC = () => {
  const [relayUrl, setRelayUrl] = useState<string>('http://localhost:8888')
  const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>()

  const videoRef = useRef<HTMLVideoElement>(null)

  const { deviceList, stream, changeStream, status: mediaStreamStatus } = useMediaStream()
  const rtc = useRTC()

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null
    }

    if (stream && rtc.connectionState === 'connected') {
      rtc.addOrReplaceTrack(stream)
    }
  }, [stream])

  const handleJoin = async () => {
    await rtc.initialize(relayUrl)
  }

  const handleDisconnect = () => {
    rtc.close()
  }

  const addTrack = () => {
    if (!stream) {
      console.error(`No stream available`)
      return
    }

    rtc.addOrReplaceTrack(stream)
  }

  const renderStatus = () => (
    <div>
      {Boolean(rtc.sessionId) && <><br /><div>ID: {rtc.sessionId}</div><br /></>}
      <div>Media: {videoDevice?.label} / {mediaStreamStatus}</div>
      <div>Status: {rtc.connectionState}</div>
    </div>
  )

  const handleMediaChange = async (ev: JSXInternal.TargetedEvent<HTMLSelectElement, Event>) => {
    const id = ev.currentTarget.value
    const device = deviceList.find(d => d.deviceId === id)

    setVideoDevice(device)
    await changeStream(id)
  }

  return (
    <>
      <div>
        {stream && <video ref={videoRef} autoPlay />}
      </div>
      <div>
        <input type="text" value={relayUrl} onInput={(e) => setRelayUrl(e.currentTarget.value)} />
        <MediaSelector onChange={handleMediaChange} selectedDeviceId={videoDevice?.deviceId} deviceList={deviceList} />
      </div>
      <div>
        <button type="button" onClick={handleJoin}>Join</button>
        <button type="button" onClick={addTrack} disabled={!stream}>Add track</button>
        <button type="button" onClick={handleDisconnect} disabled={rtc.connectionState !== 'connected'}>Disconnect</button>
      </div>
      {renderStatus()}
    </>
  )
}

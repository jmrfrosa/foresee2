import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { JSXInternal } from 'preact/src/jsx'
import { useMediaStream } from '../hooks/useMediaStream'
import { useRTC } from '../hooks/useRTC'
import { MediaSelector } from './MediaSelector'

export const RTC = () => {
  const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>()

  const videoRef = useRef<HTMLVideoElement>(null)

  const { deviceList, stream, changeStream, status: mediaStreamStatus } = useMediaStream()
  const rtc = useRTC()

  const canConnect = stream && Boolean(stream?.getVideoTracks()?.length)
  const canDisconnect =
    rtc.connectionStatus?.pcState &&
    rtc.connectionStatus?.iceState &&
    rtc.connectionStatus?.signalingState &&
    rtc.connectionStatus?.dataChannelState

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null
    }

    if (stream && rtc.connectionStatus.pcState === 'connected') {
      rtc.setMediaStream(stream)
    }
  }, [stream])

  const handleConnect = useCallback(async () => {
    if (!canConnect) {
      console.error('No video stream is present, cannot connect')
      return
    }

    rtc.initialize(stream)
  }, [canConnect, stream])

  const handleDisconnect = () => {
    rtc.close()
  }

  const renderStatus = () => (
    <div>
      {Boolean(rtc.sessionId) && <><br /><div>ID: {rtc.sessionId}</div><br /></>}
      <div>Media: {videoDevice?.label} / {mediaStreamStatus}</div>
      <div>Status: {JSON.stringify(rtc.connectionStatus, undefined, '\t')}</div>
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
        <MediaSelector onChange={handleMediaChange} selectedDeviceId={videoDevice?.deviceId} deviceList={deviceList} />
      </div>
      <div>
        <button type="button" onClick={handleConnect} disabled={!canConnect}>Connect</button>
        <button type="button" onClick={handleDisconnect} disabled={!canDisconnect}>Disconnect</button>
      </div>
      {renderStatus()}
    </>
  )
}

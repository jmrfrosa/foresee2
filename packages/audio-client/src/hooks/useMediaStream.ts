import { useCallback, useEffect, useState } from "preact/hooks"
import { getAudioStream } from "../lib/utility"

enum StreamStatusEnum {
  PENDING = 'pending',
  ALLOWED = 'allowed',
  DENIED = 'denied',
}

export const useMediaStream = () => {
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([])
  const [stream, setStream] = useState<MediaStream>()
  const [status, setStatus] = useState<StreamStatusEnum>(StreamStatusEnum.PENDING)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        await getAudioStream()

        const devices = await navigator.mediaDevices.enumerateDevices()
        setDeviceList(devices.filter(d => d.kind === 'audioinput'))
        setStatus(StreamStatusEnum.ALLOWED)
      } catch {
        setStatus(StreamStatusEnum.DENIED)
      }
    }

    fetchDevices()
  }, [])

  const changeStream = useCallback(async (deviceId: string) => {
    try {
      const newStream = await getAudioStream({ deviceId })

      setStream(newStream)
      setStatus(StreamStatusEnum.ALLOWED)
    } catch {
      setStatus(StreamStatusEnum.DENIED)
    }
  }, [])

  return {
    deviceList,
    stream,
    changeStream,
    status,
  }
}

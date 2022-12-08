import { useCallback, useEffect, useState } from "preact/hooks"
import { getVideoStream } from "../lib/utility"

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
        await getVideoStream()

        const devices = await navigator.mediaDevices.enumerateDevices()
        setDeviceList(devices)
        setStatus(StreamStatusEnum.ALLOWED)
      } catch {
        setStatus(StreamStatusEnum.DENIED)
      }
    }

    fetchDevices()
  }, [])

  const changeStream = useCallback(async (deviceId: string) => {
    try {
      const newStream = await getVideoStream({ deviceId })

      setStream((prevStream) => {
        console.log('CHANGING STREAM', { prevStream, newStream })

        return newStream
      })
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

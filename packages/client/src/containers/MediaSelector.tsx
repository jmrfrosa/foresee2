import { FunctionalComponent } from "preact"
import { JSXInternal } from "preact/src/jsx"

interface Props {
  selectedDeviceId?: string
  deviceList?: MediaDeviceInfo[]
  onChange: JSXInternal.EventHandler<JSXInternal.TargetedEvent<HTMLSelectElement, Event>>
}

export const MediaSelector: FunctionalComponent<Props> = ({ selectedDeviceId, deviceList, onChange }) => {
  return (
    <select value={selectedDeviceId} onChange={onChange}>
      {(deviceList || []).map(device => {
        return (
          <option value={device.deviceId}>{device.label}</option>
        )
      })}
    </select>
  )
}

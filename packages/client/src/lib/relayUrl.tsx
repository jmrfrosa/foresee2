const DEV_PORT = '8888'

export const getRelayURL = () => {
  let port = window.location.port
  const host = window.location.hostname
  const protocol = window.location.protocol

  if (port) port = DEV_PORT

  return `${protocol}//${port ? '' : 'relay.'}${host}${port ? `:${port}` : ''}`
}

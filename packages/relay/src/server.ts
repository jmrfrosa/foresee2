import express, { Request, Response } from "express"
import cors from "cors"
import { nanoid } from "nanoid"
import { APP_PORT } from "./constants"
import { BroadcastType } from "./requests/join.request"
import { initEventStream, writeRelay } from "./middleware/event"
import EventEmitter from "events"
// import fs from "fs"
// import os from "os"
// import path from "path"
// import https from "https"

const emitter = new EventEmitter()

run().catch((error) => console.error(error))

async function run() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  // UNCOMMENT FOR HTTPS

  // const certificate = {
  //   key: fs.readFileSync(path.join(os.homedir(), '.vite-plugin-mkcert', 'certs', 'dev.key')),
  //   cert: fs.readFileSync(path.join(os.homedir(), '.vite-plugin-mkcert', 'certs', 'dev.pem'))
  // }

  // https.createServer(certificate, app).listen(APP_PORT, () => {
  //   console.log(`Running relay server on port ${APP_PORT}`)
  // })

  app.listen(APP_PORT, () => console.log(`Running relay server on port ${APP_PORT}`))

  app.get('/client/join', (req, res) => {
    const userId = nanoid(10)
    console.log(`Client joining, assigned id: ${userId}`)

    return res.status(200).send(userId)
  })

  app.post('/client/broadcast', (req: Request<never, unknown, BroadcastType>, res) => {
    console.log(`Broadcasting client message to server`)
    const { body } = req

    emitter.emit('clientRelay', body)
    return res.sendStatus(200)
  })

  app.post('/server/broadcast', (req: Request<never, unknown, BroadcastType>, res) => {
    console.log(`Broadcasting server message to clients`)
    const { body } = req

    emitter.emit('serverRelay', body)
    return res.sendStatus(200)
  })

  app.get('/clients/watch', [initEventStream], (req: Request, res: Response) => {
    const handler = (ev: BroadcastType) => writeRelay(ev, res)
    emitter.on('clientRelay', handler)

    req.on('close', () => {
      console.log('REMOVING LISTENER clientRelay, current listeners: %o', emitter.listenerCount('clientRelay'))

      emitter.removeListener('clientRelay', handler)
    })
  })

  app.get('/server/watch', [initEventStream], (req: Request, res: Response) => {
    const handler = (ev: BroadcastType) => writeRelay(ev, res)
    emitter.on('serverRelay', handler)

    req.on('close', () => {
      console.log('REMOVING LISTENER serverRelay, current listeners: %o', emitter.listenerCount('serverRelay'))

      emitter.removeListener('serverRelay', handler)
    })
  })
}

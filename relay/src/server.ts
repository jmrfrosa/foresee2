import express, { Request, Response } from "express"
import cors from "cors"
import { nanoid } from "nanoid"
import { APP_PORT } from "./constants"
import { BroadcastType } from "./requests/join.request"
import { initEventStream, writeRelay } from "./middleware/event"
import EventEmitter from "events"
import fs from "fs"
import os from "os"
import path from "path"
import https from "https"

const emitter = new EventEmitter()

run().catch((error) => console.error(error))

async function run() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  const certificate = {
    key: fs.readFileSync(path.join(os.homedir(), '.vite-plugin-mkcert', 'certs', 'dev.key')),
    cert: fs.readFileSync(path.join(os.homedir(), '.vite-plugin-mkcert', 'certs', 'dev.pem'))
  }

  https.createServer(certificate, app).listen(APP_PORT, () => {
    console.log(`Running relay server on port ${APP_PORT}`)
  })

  app.get('/client/join', (req, res) => {
    const userId = nanoid(10)

    return res.status(200).send(userId)
  })

  app.post('/client/broadcast', (req: Request<never, unknown, BroadcastType>, res) => {
    const { body } = req

    emitter.emit('clientRelay', body)
    return res.sendStatus(200)
  })

  app.post('/server/broadcast', (req: Request<never, unknown, BroadcastType>, res) => {
    const { body } = req

    emitter.emit('serverRelay', body)
    return res.sendStatus(200)
  })

  app.get('/clients/watch', [initEventStream], (req: Request, res: Response) => {
    emitter.on('clientRelay', (ev: BroadcastType) => writeRelay(ev, res))
  })

  app.get('/server/watch', [initEventStream], (req: Request, res: Response) => {
    emitter.on('serverRelay', (ev: BroadcastType) => writeRelay(ev, res))
  })
}

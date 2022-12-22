# Foresee v2

Visual generative application taking user video input and mixing it with system audio, joining them together in a 3d render.

- [x] Client application
- [x] WebRTC signaling server
- [x] Live video broadcast into 3d engine
- [x] Audio input & analysis
- [x] Generative visuals

**It works!**

Still very crude, though.

------------

## Installation

The application is made out of three different packages, joined together using the npm workspaces feature. These are explained below. In order to setup the repository, you simply need to:

```bash
$ npm install
```

And all necessary packages for all three apps should be installed. They can then be started using:

```bash
npm run client:dev
npm run relay:dev
npm run visual:dev
```

Inside the root directory.

<details>
<summary>Deployment</summary>

The steps above are intended for development. Production builds can be generated using:
```bash
npm run client:build
npm run relay:build
npm run visual:build
```

`client` and `visual` are frontend-only and so can be served through a static fileserver such as nginx. Copy over the directory to the server root using e.g:
```bash
cp -r ./packages/client/build /var/www/<project_name>/
```

`relay`, however, is a backend node.js app. You can run it (after building) using:
```
npm run relay:start
```
  
</details>


## How does it work?

![image](https://user-images.githubusercontent.com/15141951/209231246-789fcf7a-4ae7-41fe-83d3-7a9d939fde42.png)

### Client

This is the public-facing application, consisting of a frontend server (using Vite and Preact). This application:
- Starts and handles a WebRTC connection with the visuals server, through the signaling server
- Handles a one-way video broadcast through the established WebRTC connection

The entire WebRTC connector is implemented as a custom Preact hook for better UI usability.

### Relay

In order for WebRTC to work, we need a third server between both peers in order for them to exchange and negotiate connection information.

We usually call this the "signaling server", and it simply broadcasts messages between peers. Since this app has a "many clients to one visual server" broadcasting architecture, the signaling server is implemented using Server Sent Events for both sides. Each public peer is first attributed an ID, which is used to listen and broadcast for communications matching that identifier. The visual server listens to all received client events, creating matching peer connections.

This application uses vanilla Express.

### Visual

This is the frontend for the generative visuals. It's a BabylonJS application which receives client video broadcasts and system audio; relaying that data over to the 3D engine, which will use it to build a multimedia experience.

It's still currently very crude. Video textures are implemented, and a plane for each one is created on connection start.

## Usage

In order to run and use the application on a single machine, all three servers must be running at the same time.

1. Navigate to the `client` URL. Allow media device usage and ensure the URL set for the relay server is correct (it will be, by default).
2. Navigate to the `visual` URL. This window will need to be open in order for both services to communicate.
3. Select a video source. The broadcast won't start otherwise.
4. First, click "Join". This will request an ID from the relay server. Then, "Add Track" will negotiate the rest of the connection.
5. You should now be connected to the `visual` server. Confirm this in the `visual` tab.

## Development

The current display code can be edited in `/packages/visual/src/lib/scene.ts`. Here you'll find two event hooks:
- `onConnectedPeer`: fires every time a new peer is connected. Right now we're adding a new plane to the scene with the client's video feed, when this happens.
- `onDisconnectedPeer`: fires every time a peers disconnects. The video feed and source elements from this peer connection are removed.


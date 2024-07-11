<div align="center">
  <br />
  <p>
    <a href="https://www.npmjs.com/package/@neko-gong/simple-rpc"
      ><img
        src="https://img.shields.io/npm/v/@neko-gong/simple-rpc.svg?maxAge=3600"
        alt="NPM version"
    /></a>
    <a href="https://www.npmjs.com/package/@neko-gong/simple-rpc"
      ><img
        src="https://img.shields.io/bundlephobia/min/%40neko-gong%2Fsimple-rpc?maxAge=3600
    "
        alt="License"
    /></a>
    <a href="https://www.npmjs.com/package/@neko-gong/simple-rpc"
      ><img
        src="https://img.shields.io/npm/unpacked-size/%40neko-gong%2Fsimple-rpc?maxAge=3600
    "
        alt="NPM downloads"
    /></a>
    <a href="https://github.com/SherlockGn/simple-rpc/blob/main/LICENSE"
      ><img
        src="https://img.shields.io/badge/License-MIT-blue?maxAge=3600"
        alt="License"
    /></a>
  </p>
</div>


# Simple RPC

## Introduction

The Simple RPC is a Node.js framework which simplifies the process of creating web servers and minimizes the communication efforts. With Simple RPC, you can invoke server-side functions from your client as if they were local, eliminating the need for RESTful APIs.

To get more information, please refer to the [documentation](https://sherlockgn.github.io/simple-rpc/).

## Features and Highlights

-   With async/await, the RPC framework is very easy to use.
-   The serialization algorithm allows you to pass data of common types that JSON.stringify cannot handle, such as undefined, Date, RegExp, Infinity, Set, Map, and more.
-   The serialization algorithm allows you to pass data with circular properties.
-   The RPC framework allows you to upload or download files.
-   The RPC framework allows you to add authorization, end, or error handling middlewares.
-   The RPC framework allows you to add static pages and handle CORS.
-   The RPC framework is implemented in JavaScript and is quite lightweight, not relying on any other third-party libraries.

## Installation (Server or Client)

```
npm install @neko-gong/simple-rpc
```

## Quick Start

### Server

For the server side, both ESM and CJS are supported.

Assume you have a folder named `rpc` where all the modules you want to expose to the client are located.

The file structure should be like this:

```
project/
  ├── rpc/
  │   ├── user.js
  │   └── file.js
  └── server.js
```

In the file `server.js`, you can use the following code to create a server:

```javascript
import { createServer } from '@neko-gong/simple-rpc'

const server = createServer()
server.useRpc('./rpc')

await server.start()
```

In the file `rpc/user.js`, you can create several exported functions:

```javascript
export const getById = id => {
    return { id, name: 'John' }
}

export const add = async user => {
    await new Promise(resolve => setTimeout(resolve, 5000))
    return user
}
```

### Client

For the client side, you can use Node.js (ESM or CJS) or browser (ESM or UMD).

```javascript
import client from '@neko-gong/simple-rpc/client'

client.settings.host = 'http://localhost:8080'

let user = await client.user.getById(1)
console.log(user)

user = await client.user.add({ id: 2, name: 'Jane' })
console.log(user)
```

For using UMD, access the global variable `simpleRpcClient`:

```html
<script src="node_modules/@neko-gong/simple-rpc/dist/client-umd.js"></script>
```

```javascript
const client = simpleRpcClient.default

const user = await client.user.getById(1)
console.log(user)
```

To get more information about how Simple RPC is used and implemented, please refer to the [documentation](https://sherlockgn.github.io/simple-rpc/).

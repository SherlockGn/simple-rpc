# Introduction

The Simple RPC is a Node.js framework which simplifies the process of creating web servers and minimizes the communication efforts. With Simple RPC, you can invoke server-side functions from your client as if they were local, eliminating the need for RESTful APIs.

# Features and Highlights

-   With async/await, the RPC framework is very easy to use.
-   The serialization algorithm allows you to pass data of common types that JSON.stringify cannot handle, such as undefined, Date, RegExp, Infinity, Set, Map, and more.
-   The serialization algorithm allows you to pass data with critical properties.
-   The RPC framework allows you to upload or download files.
-   The RPC framework allows you to add authorization, end, or error handling middleware.
-   The RPC framework allows you to add static pages and handle CORS.
-   The RPC framework is implemented in JavaScript and is quite lightweight, not relying on any third-party libraries.

# Installation (Server or Client)

```
npm install @neko/simple-rpc
```

# Quick Start

## Server

For the server side, both ESM and CJS are supported.

Assume you have a folder named `rpc` where all the modules you want to expose to the client are located.

The file structure should be like this:

```
project/
  ├── rpc/
  │   ├── user.js
  │   └── post.js
  └── server.js
```

In the file `server.js`, you can use the following code to create a server:

```javascript
import { createServer } from '@neko/simple-rpc'

;(async () => {
    const server = createServer()
    server.useRpc('./rpc')

    await server.start()
})()
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

## Client

For the client side, both ESM and CJS are supported.

```javascript
import client from '@neko/simple-rpc/client'

client.host = 'http://localhost:8080'

let user = await client.user.getById(1)
console.log(user)

user = await client.user.add({ id: 2, name: 'Jane' })
console.log(user)
```

Or you can use UMD to access the global variable `simpleRpcClient`:

```html
<script src="node_modules/@neko/simple-rpc/dist/client-umd.js"></script>
```

```javascript
simpleRpcClient.host = 'http://localhost:8080'
const user = await simpleRpcClient.user.getById(1)
console.log(user)
```

To get more detailed information about how Simple RPC is used and how it is implemented, please refer to the [documentation](link).

# Quick Start

## Installation

To install Simple RPC, simply run the following command in your server project folder or client project folder:

```shell
npm install @neko/simple-rpc
```

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

::: code-group

```javascript [ESM]
import { createServer } from '@neko/simple-rpc'

;(async () => {
    const server = createServer()
    server.useRpc('./rpc')

    await server.start()
})()
```

```javascript [CJS]
const { createServer } = require('@neko/simple-rpc')

;(async () => {
    const server = createServer()
    server.useRpc('./rpc')

    await server.start()
})()
```

:::

In the file `rpc/user.js`, you can create several exported functions:

::: code-group

```javascript [ESM]
export const getById = id => {
    return { id, name: 'John' }
}

export const add = async user => {
    await new Promise(resolve => setTimeout(resolve, 5000))
    return user
}
```

```javascript [CJS]
const getById = id => {
    return { id, name: 'John' }
}

const add = async user => {
    await new Promise(resolve => setTimeout(resolve, 5000))
    return user
}

module.exports = { getUserById, addUser }
```

:::

## Client

For the client side, both ESM and CJS are supported.

::: code-group

```javascript [ESM]
import client from '@neko/simple-rpc/client'

client.host = 'http://localhost:8080'

let user = await client.user.getById(1)
console.log(user)

user = await client.user.add({ id: 2, name: 'Jane' })
console.log(user)
```

```javascript [CJS]
const client = require('@neko/simple-rpc/client')

client.host = 'http://localhost:8080'

let user = await client.user.getById(1)
console.log(user)

user = await client.user.add({ id: 2, name: 'Jane' })
console.log(user)
```

:::

Or you can use UMD to access the global variable `simpleRpcClient`:

```html
<script src="node_modules/@neko/simple-rpc/dist/client-umd.js"></script>
```

```javascript
simpleRpcClient.host = 'http://localhost:8080'
const user = await simpleRpcClient.user.getById(1)
console.log(user)
```
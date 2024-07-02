# Introduction

The Simple RPC framework for Node.js (JavaScript) simplifies the process of creating web servers by minimizing communication efforts. With Simple RPC, you can invoke server-side functions from your client as if they were local, eliminating the need for RESTful APIs.

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
// For CJS, const { createServer } = require('@neko/simple-rpc')
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

// For CJS, module.exports = { getUserById, addUser }
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

# APIs

## Server

### createServer(options)

Example:

```javascript
const server = createServer({
    port: 8080,
    host: '0.0.0.0'
})
```

Creates a new server instance.

#### options

-   `options.port`: The port number to listen on. Defaults to 8080.

For other properties in `options`, See:

- HTTPS create server options(https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener)
- HTTP create server options(https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener)
- Listen options of the server(https://nodejs.org/api/net.html#serverlistenoptions-callback)

#### server.server

The created server instance.

#### server.options

The options passed to the `createServer`. The port number is also included in this object.

#### server.useProtocol

Specifies which protocol to use. Must be one of `http`, `https` or `null`. Defaults to `null`. If set `null`, the server will determine the protocol based on the `options.key` and `options.cert`.

#### server.useRpc(folder)

Specifies the folder path of the RPC modules. See Quick Start for the example.

#### server.useCors(origins)

Specifies if CORS is enabled. Defaults to `*`. If you want to specify the allowed methods or headers, pass an object. For example:

```javascript
server.useCors({
    origins: 'http://mydomain.com',
    methods: 'GET, POST',
    headers: 'Content-Type, Authorization',
    credential: true
})
```

#### server.useStatic(folder)

Specifies the folder path of the static files. The server will serve static files from the specified folder.

#### server.useAuth(async ctx => { ... })

Specifies the authentication middleware. The middleware will be called before executing the remote function.

You can get the module names, method names and parameters from the `ctx` object.

```javascript
const { module, method, params, extra } = ctx
```

For example, if you want to authorize each function call, we recommend you to write the code here, and set the user to `ctx.state`. In the exposed remote functions, you can use `this` to get the `ctx` variable. If you want to access `this`, do not use arrow functions.

```javascript
// server.js
server.useAuth(async (ctx, next) => {
    const { module, method, params, extra } = ctx
    const user = await checkToken(extra.token)
    if (user) {
        ctx.state = user
    } else {
        throw new Error('Unauthorized')
    }
}

// user.js
export function getFriends() {
    // the variable ctx is injected to this
    const user = this.state.user
    return await retriveFriends(user)
}
```

```javascript
client.extra = token
const friends = await client.user.getFriends()
```

#### server.useError(async (ctx, error) => { ... })

Specifies the error handler middleware. The middleware will be called when an error occurs.

#### server.useEnd(async ctx => { ... })

Specifies the end handler middleware. The middleware will be called when the remote function execution is completed.

Note: the static file handing or the browser preflight handing will not go to end handler middleware.

#### async server.start()

Starts the server.

#### server.close()

Closes the server.

## Client

### client.host

The host name or IP address of the server. E.g., https://example.com:1234.

### client.extra

The extra data passed to the server. We recommend to put the data required by all RPCs here, e.g., token.

### client.download

The callback function to handle the progress of receiving data. For example:

```javascript
client.download = (progress, total) => {
    console.log(`${progress} / ${total}`)
}
```

### client.upload

The callback function to handle the progress of sending data. For example:

```javascript
client.upload = (progress, total) => {
    console.log(`${progress} / ${total}`)
}
```

## RPC

### Functions

The RPC modules are located in the `folder` specified in `server.useRpc`. Modules are imported dynamically.

The following types of function parameters or return value are supported:

- All types supported by JSON.stringify, e.g., `number`, `string`, `boolean`, `null`, `undefined`, `object`, `array`.
- Date
- RegExp
- BigInt
- Symbol
- Infinity
- NaN
- undefined
- Error
- Set
- Map

Besides, the object with circle reference is also supported. Here is an example.

For server:

```javascript
// in file user.js
export const getTest = () => {
    const user = {
        id: 1,
        birth: new Date('1990-01-01'),
        friends: new Set([2, 3])
    }
    user.self = user
    user.friend.add(user)
    user.map = new Map([[user, user.friends]])

    return user 
}
```

For client:

```javascript
const user = await client.user.getTest()
console.log(user.birth instanceof Date) // true
console.log(user === user.self) // true
console.log(user.map.get(user) === user.friends) // true
```

If you throw an error from the server side, the client will caught the error as well.

For server:

```javascript
export const testError = () => {
    throw new ReferenceError('test error')
}
```

For client:

```javascript
try {
    await client.user.testError()
} catch (error) {
    console.log(error instanceof ReferenceError) // true
    console.log(error.message) // test error
}
```

### Upload and Download Files

You can use `FileRsp` to return a file.

For server:

```javascript
// file.js
import { FileRsp } from '@neko/simple-rpc'

export const getImage = () => {
    return FileRsp('path-to-the-image')
    // Or you can use Buffer
    // const buffer = fs.readFileSync(path)
    // return FileRsp(buffer)
}
```

For client:

If you're using browser, simply use `client.url` to generate the image URL.

```html
<img src="" id="myimg" />
```

```javascript
const img = document.getElementById('myimg')
img.src = client.url.file.getImage()
```

To upload files, use `File` or `Blob` as function parameters.

For client:

```html
<input type="file" name="file" multiple="multiple">
```

```javascript
const fileinput = document.querySelector('input[name="file"]')
fileinput.onchange = async event => {
    const fileList = event.target.files
    await client.file.upload(fileList, new Blob([1, 2, 3, 4, 5, 6]))
}
```

For server:

Each blob object will be converted to an object with properties `name`, `size` and `stream`. Use `stream` to write the data to the disk.

```javascript
// file.js
export const upload = (fileList, blob) => {
    const uploadFolder = join(dirname, 'upload')
    for (let i = 0; i < fileList.length; i++) {
        const item = fileList[i]
        item.stream.pipe(fs.createWriteStream(join(uploadFolder, item.name)))
    }
    blob.pipe(
        fs.createWriteStream(join(uploadFolder, 'blob.txt'))
    )
}
```

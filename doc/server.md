# Server

The server object is the returned value of function `createServer`.

## server.server

The created native server instance.
See: [http.Server](https://nodejs.org/api/http.html#class-httpserver), [https.Server](https://nodejs.org/api/https.html#class-httpsserver).

## server.options

The options passed to the `createServer`. The port number is also included in this object.

For example:

```javascript
const server = createServer()
console.log(server.options.port) // 8080
```

## server.useProtocol(protocol)

Specifies which protocol to use. Must be one of `'http'`, `'https'` or `null`. Defaults to `null`. If set `null`, the server will determine the protocol based on the `options.key` and `options.cert`.

For example:

```javascript
const server = createServer()
server.useProtocol('http') // force to use HTTP protocol
```

## server.useRpc(folder)

Specifies the folder path of the RPC modules. All JavaScript files (`.mjs`, `.cjs`, `.js`) in the folder (including sub-folders) will be exposed to the client. Specify a relative path or an absolute path.

For example:

```javascript
const server = createServer()
server.useRpc('./rpc') // relative path
```

::: code-group

```javascript [ESM]
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const dir = dirname(fileURLToPath(import.meta.url))

const server = createServer()
server.useRpc(join(dir, 'rpc')) // absolute path
```

```javascript [CJS]
const { join } = require('path')

const dir = __dirname

const server = createServer()
server.useRpc(join(dir, 'rpc')) // absolute path
```

:::

To get more detailed information about RPC, see [RPC](rpc.md).

## server.useCors(origins)

Call this function to enable CORS. The parameter `origins` defaults to `*`. 

For example:

```javascript
server.useCors()
```

is the same as:

```javascript
server.useCors('*')
```


To specify the origin, use:

```javascript
server.useCors('http://mydomain.com')
```

If you want to specify the allowed methods or headers, pass an object.

For example:

```javascript
server.useCors({
    origins: 'http://mydomain.com',
    methods: 'GET, POST',
    headers: 'Content-Type, Authorization',
    credential: true
})
```

## server.useStatic(folder)

Specifies the folder path of the static files. The server will serve static files from the specified folder.

Assume your project structure is:

```
project/
  ├── public/
  │   ├── index.html
  │   └── style.css
  ├── rpc/
  │   └── user.js
  └── server.js
```

Use:

```javascript
const server = createServer()
server.useStatic('./public')

await server.start()
```

Then you can access the static files via `http://localhost:8080/` or `http://localhost:8080/index.html`.

## server.useAuth(async ctx => { ... })

Specifies the authentication middleware. The middleware will be called before executing the remote function.

You can get the module names, method names and parameters from the `ctx` object.

```javascript
const { module, method, params, extra } = ctx
```

For example, if you want to authorize before each function call, we recommend you to write the logic in `useAuth`, and add the user (or any other custom object) to `ctx.state`. In the exposed remote functions, use `this` to get the `ctx` variable.

```javascript
// server.js
server.useAuth(async ctx => {
    const { module, method, params, extra } = ctx
    const user = await checkToken(extra.token)
    if (user) {
        ctx.state = user
    } else {
        throw new Error('Unauthorized')
    }
})

// user.js
export const getFriends = function () {
    // the variable ctx is injected to this
    const user = this.state.user
    return await retrieveFriends(user)
}
```

::: tip
If you want to access `ctx` by using `this`, do not use arrow functions.
:::

In your client, use:

```javascript
client.settings.extra.token = token
const friends = await client.user.getFriends()
```

For more information about `ctx`, see [RPC Context](rpc-context.md).

## server.useError(async (ctx, error) => { ... })

Specifies the error handler middleware. The middleware will be called when an error occurs.

For example, you can log the error in `useError`:

```javascript
server.useError(async (ctx, error) => {
    console.error(error)
})
```

For more information about `ctx`, see [RPC Context](rpc-context.md).

## server.useEnd(async ctx => { ... })

Specifies the end handler middleware. The middleware will be called when the remote function execution is completed.

Note: the static file handing or the browser preflight handing will not go to end handler middleware.

For example, you can log the execution time in `useEnd`:

```javascript

server.useAuth(async ctx => {
    ctx.state.start = Date.now()
})

server.useEnd(async ctx => {
    const { start } = ctx.state
    const executionTime = Date.now().getTime() - start.getTime()
    console.log(`Execution time: ${executionTime}ms`)
})
    
```

For more information about `ctx`, see [RPC Context](rpc-context.md).

## server.usePlugin(async (req, res, ctx) => { ... })

Specifies the plugin middleware. The middleware will be called at the beginning of receiving the request.

If the returned value is `true`, the request will not be processed by the framework.

::: warning
As an RPC framework, we don't want you to be involved in any detail about HTTP request and response. Do not use this unless you know exactly what you are doing.
:::

For example, you can add a custom header in `usePlugin`:

```javascript
server.usePlugin(async (req, res, ctx) => {
    res.setHeader('X-Custom-Header', 'Hello World')
})
```

## async server.start()

Starts the server.

## server.close()

Closes the server.
# Server

The server object is the returned value of function `createServer`.

## server.server

The created native server instance.

## server.options

The options passed to the `createServer`. The port number is also included in this object.

## server.useProtocol(protocol)

Specifies which protocol to use. Must be one of `'http'`, `'https'` or `null`. Defaults to `null`. If set `null`, the server will determine the protocol based on the `options.key` and `options.cert`.

## server.useRpc(folder)

Specifies the folder path of the RPC modules. See [Quick Start](quick-start) for the example.

## server.useCors(origins)

Call this function to enable CORS. The parameter `origins` defaults to `*`. If you want to specify the allowed methods or headers, pass an object. For example:

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

## server.useAuth(async ctx => { ... })

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

## server.useError(async (ctx, error) => { ... })

Specifies the error handler middleware. The middleware will be called when an error occurs.

## server.useEnd(async ctx => { ... })

Specifies the end handler middleware. The middleware will be called when the remote function execution is completed.

Note: the static file handing or the browser preflight handing will not go to end handler middleware.

## async server.start()

Starts the server.

## server.close()

Closes the server.
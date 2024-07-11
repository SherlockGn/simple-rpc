# RPC Context

You can access the `ctx` in the middlewares, including `useAuth`, `useError`, `useEnd` and `usePlugin`.

## Middlewares

To know about how to use the middlewares, please refer to [Server](./server).

Let's check out which properties you can use in the middlewares.

| Middleware | Parameters | Available Properties |
| --- | --- | --- |
| `usePlugin` | `req`, `res`, `ctx` | `state` |
| `useAuth` | `ctx` | `state`, `type`, `module`, `method`, `params`, `blobInfo`, `extra`, `entry` |
| `useError` | `ctx` | `state`, `type`, `module`, `method`, `params`, `blobInfo`, `extra`, `entry`, `error` |
| `useEnd` | `ctx` | `state`, `type`, `module`, `method`, `params`, `blobInfo`, `extra`, `entry`, `error`, `result` |

Let's go through each property.

## state

The `ctx.state` is always an empty object when the server receives a request. You can use it to store your custom data in the middlewares.

For example:

```javascript

server.useAuth(async ctx => {
    ctx.state.user = await checkToken(ctx.extra.token)
})

```

### type

The property `type` indicates the type of the request. The value could be:

| Value | Description |
| --- | --- |
| `header` | The RPC info is stored in the header of the request. |
| `post` | The PRC info is stored in the body of the request, the method is `POST`. |
| `get` | The PRC info is stored in the URL of the request, the method is `GET`. |

:::warning
We don't recommend you to access the property `type` since you should not get involved in the details of HTTP requests.

Do not modify the value otherwise the framework might not work as expected.
:::


### module

The module of the remote call. It is an array, which contains the module name and the sub module name.

For example, when you use client to start an RPC:

```javascript
await client.myModule.submodule.add(1, 2, 3)
```

The `module` will be `['myModule', 'submodule']`.

There are some use cases.

Use this property to distinguish different logics in `useAuth`. For example:

```javascript

const requireAuth = ctx => {
    const isUserLogIn =
        ctx.module.length === 1 &&
        ctx.module[0] === 'user' &&
        ctx.method === 'login'
    return !isUserLogIn
}

server.useAuth(async ctx => {
    if (requireAuth(ctx)) {
        ctx.state.user = await checkToken(ctx.extra.token)
    }
})

```

Log errors or results in `useError` or `useEnd`. For example:

```javascript

server.useError(async (ctx, error) => {
    console.error(`${ctx.module.join('.')}.${ctx.method}`, error)
})

```

### method

The method of the RPC call. It is a string.

For example, when you use client to start an RPC:

```javascript
await client.myModule.submodule.add(1, 2, 3)
```

The `method` will be `add`.

### params

The parameters of the RPC call. It is an array.

For example, when you use client to start an RPC:

```javascript
await client.myModule.submodule.add(1, 2, 3)
```

The `params` will be `[1, 2, 3]`.

### blobInfo

The blob info of the RPC call. It only has a value when you're uploading files. An example of `ctx.blobInfo`:

```javascript

[
    {
        name: 'a.mp3',
        size: 58884595,
        lastModified: 1717724030808,
        type: 'audio/mpeg'
    },
    {
        name: null,
        size: 1000,
        lastModified: null,
        type: ''
    }
]

```

Actually, you don't need to access this property from `ctx` directly. In your exposed RPC functions in server, read the metadata from the parameters. For example:

```javascript

export const simpleUpload = blob => {
    console.log(blob.name)
    console.log(blob.lastModified)
}

```

### extra

The extra info of the request. This can be specified when using `client.settings.extra`. We recommend you to put the data which you want every function call to use
 in the `extra` property.

For example:

```javascript

client.settings.extra.token = 'abc'
await client.myModule.submodule.add(1, 2, 3)

```

The `extra` will be `{ token: 'abc' }`.

### entry

The remote function to execute.

::: warning
I don't think there is any scenario to use `entry` since the function will be invoked by RPC framework automatically.

Even if you want to call it again, bind the `ctx` to `this` before calling.
:::

### error

If there is any error thrown during remote function call or the middlewares, the `ctx.error` is the error object.

Or you can check if it has a value in `useEnd` to distinguish if the request is successful or not.

```javascript
server.useEnd(async ctx => {
    if (ctx.error) {
        console.error('error occurred')
    } else {
        console.log('successfully')
    }
})
```

### result

The result of the RPC call. For example, if you call `add` function:

```javascript
await client.myModule.submodule.add(1, 2, 3)
```

The `result` will be `6`.

:::tip
You should not check if it is `undefined` to determine whether the remote is success or not since the RPC function might not return anything.
:::
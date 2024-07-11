# Client

## client.settings.host

The host name or IP address of the server. The default value is `''`. For example:

```javascript
client.settings.host = 'https://example.com:1234'
```

::: tip
You must specify the `host` when you use the client in Node.js.

If not specified in the browser environment, the client uses the current page address as the host.
:::


## client.settings.extra

The extra data passed to the server. The default value is `{}`. We recommend to put the data required by all remote functions here, For example, the token.

```javascript
client.settings.extra.token = await generateToken()

await client.user.getById(1)
```

## client.settings.useFetch

Whether to use the `fetch` APIs to send requests. The default value is `false`. For example:

```javascript
client.settings.useFetch = true
```

Here are which APIs are used to implement the RPC client.

| settings.useFetch | Browser | Node.js
| --- | --- | --- |
| `false` | `XMLHttpRequest` | `http.request` or `https.request` |
| `true` | `fetch` | `fetch` |


## client.settings.download

The callback function to handle the progress of receiving data. For example:

```javascript
client.download = (progress, total) => {
    console.log(`${progress} / ${total}`)
}
```

To use client to download or upload files, or generate file URLs, refer to [Files](files.md).

## client.settings.upload

The callback function to handle the progress of sending data. For example:

```javascript
client.upload = (progress, total) => {
    console.log(`${progress} / ${total}`)
}
```

::: tip
The callback function is only called when `XMLHttpRequest` is used.
:::


To use client to download or upload files, or generate file URLs, refer to [Files](files.md).

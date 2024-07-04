# Client

## client.host

The host name or IP address of the server. E.g., https://example.com:1234.

## client.extra

The extra data passed to the server. We recommend to put the data required by all RPCs here, e.g., token.

## client.download

The callback function to handle the progress of receiving data. For example:

```javascript
client.download = (progress, total) => {
    console.log(`${progress} / ${total}`)
}
```

## client.upload

The callback function to handle the progress of sending data. For example:

```javascript
client.upload = (progress, total) => {
    console.log(`${progress} / ${total}`)
}
```
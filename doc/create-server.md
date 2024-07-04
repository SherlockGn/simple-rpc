# createServer(options)

Example:

```javascript
import { createServer } from '@neko/simple-rpc'
import fs from 'fs'

const server = createServer({
    port: 8080,
    host: '0.0.0.0',
    keepAlive: true,
    key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
    cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
})
```

Creates a new server instance.

## options

The options used to create or starts the server. If not specified, all default values will be used.

-   `options.port`: The port number to listen on. Defaults to 8080.

For other properties in `options`, like: `host`, `keepAlive`, `key`, `cert`, etc., see:

- [HTTPS create server options](https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener)
- [HTTP create server options](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener)
- [Listen options of the server](https://nodejs.org/api/net.html#serverlistenoptions-callback)

The function returns a server object, to get the APIs of the server, see: [Server](./server)
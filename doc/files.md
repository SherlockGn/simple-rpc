# Files

One of the most powerful features of `@neko-gong/simple-rpc` is the ability to upload and download files.

To download or upload files, you need to make file as a function parameter or return value.

Assume you have an exposed module `file.js`.

```
project/
  ├── rpc/
  │   └── file.js
  └── server.js
```

## Download Files

You can use `FileRsp` to return a file.

For server:

::: code-group

```javascript [ESM]
// file.js
import { FileRsp } from '@neko-gong/simple-rpc'

export const getImage = () => {
    return FileRsp('path-to-the-image')
}
```

```javascript [CJS]
// file.js
const { FileRsp } = require('@neko-gong/simple-rpc')

const getImage = () => {
    return FileRsp('path-to-the-image')
}

module.exports = { getImage }
```

:::

Or you can use `Buffer` to initialize `FileRsp`. This would be helpful if the file is virtual.

::: code-group

```javascript [ESM]
// file.js
import { FileRsp } from '@neko-gong/simple-rpc'
import fs from 'fs'

export const getImage = () => {
    const buffer = fs.readFileSync(path)
    return FileRsp(buffer)
}
```

```javascript [CJS]
// file.js
const { FileRsp } = require('@neko-gong/simple-rpc')
const fs = require('fs')

const getImage = () => {
    const buffer = fs.readFileSync(path)
    return FileRsp('path-to-the-image')
}

module.exports = { getImage }
```

:::

For client, if you're using browser, simply use `client.url` to generate the image URL.

```html
<img src="" id="my-img" />
```

```javascript
import client from '@neko-gong/simple-rpc/client'

const img = document.getElementById('my-img')
img.src = client.url.file.getImage()
```

If you're using Node.js, simply download the file using the URL as well.

::: code-group

```javascript [ESM, fetch]
import fs from 'fs'
import client from '@neko-gong/simple-rpc/client'

const res = await fetch(client.url.file.getImage())
const buf = Buffer.from(await res.arrayBuffer())
await fs.writeFile('./img.png', buf)
```

```javascript [CJS, fetch]
const fs = require('fs')
const { default: client } = require('@neko-gong/simple-rpc/client')

;(async () => {
    const res = await fetch(client.url.file.getImage())
    const buf = Buffer.from(await res.arrayBuffer())
    await fs.writeFile('./img.png', buf)
})()
```

:::

## Upload files

To upload files, use `File`, `Blob` or `FileList` as function parameters.

For client, if you're using browser:

```html
<input type="file" name="file" multiple="multiple">
```

```javascript
const fileInput = document.querySelector('input[name="file"]')
fileInput.onchange = async event => {
    const fileList = event.target.files
    await client.file.upload(fileList[0])
    await client.file.upload(new Blob([1, 2, 3, 4, 5]))
}
```

If you're using Node.js, use exported `file` object to generate a Blob instance.

::: code-group

```javascript [ESM]
import client from '@neko-gong/simple-rpc/client'
import { file } from '@neko-gong/simple-rpc/client'

await client.file.upload(await file('path-to-the-file'))
```

```javascript [CJS]
const { default: client, file } = require('@neko-gong/simple-rpc/client')

;(async () => {
    await client.file.upload(await file('path-to-the-file'))
})()
```

:::

For server:

Each blob object will be converted to an object with properties `name`, `size`, `type`, `lastModified` and `stream`. Use `stream` to write the data to the disk.

::: code-group

```javascript [ESM]
// file.js
import fs from 'fs'

export const upload = blob => {
    blob.stream.pipe(
        fs.createWriteStream(blob.name ?? 'blob.txt')
    )
}
```

```javascript [CJS]
// file.js
const fs = require('fs')

const upload = blob => {
    blob.stream.pipe(
        fs.createWriteStream(blob.name ?? 'blob.txt')
    )
}

module.exports = { upload }
```

:::

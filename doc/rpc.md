# RPC

## Functions

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

## Upload and Download Files

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
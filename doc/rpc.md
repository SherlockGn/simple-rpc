# RPC

The RPC allows you to call remote functions just like call the local ones. Navigate to [Quick Start](./quick-start) to get some examples.

Here, I'd like to show you some information not mentioned before.

## Sub-modules

You can create sub-modules in your server side. For example, project file structure
```
project/
  ├── rpc/
  │   └── users/
  │       └── profile.js
  └── server.js
```

Use client by linking all folder names to call the function `getById` in `profile.js`:

```javascript
const profile = await client.users.profile.getById(3)
```

## Naming restriction

The module name (including sub-names) must be combined by alphabets or numbers. Otherwise, you will get an error of `invalid request`.

The framework tries to import the module dynamically from the specified file name with extension `.mjs`, `.cjs` and `.js`. If the module is not found, you will get an error of `module not found`.

You can only call the methods which is exported by the module and is owned properties of the object. Otherwise, you will get an error of `method not found`.

::: tip
If you use invalid module names or invalid method names, the middleware `useAuth` will not be triggered.
:::


## Function parameters and returned values

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

## Error Handling

If you throw an error from the server side, the client will throw the same error as well.

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

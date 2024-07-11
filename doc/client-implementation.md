# Client Implementation

The client uses `Proxy` to make a chain calling possible.

You can find the client implementation in the source code.

```javascript

const factory = chain => {
    const f = () => {}
    f.chain = chain

    return f
}

const url = ...

const clientHandler = {
    get: (target, prop) => {
        if (prop === 'settings') {
            return settings
        }
        if (prop === 'url') {
            return url
        }
        const newChain = [...target.chain, prop]
        return new Proxy(factory(newChain), clientHandler)
    },
    apply: async (target, _this, params) => {
        if (target.chain.length < 2) {
            throw new Error('Invalid length')
        }
        const module = [...target.chain]
        const method = module.pop()

        return await invoke(module, method, params)
    }
}

const client = new Proxy({ settings, chain: [] }, clientHandler)
```

import { serialize, serializeWithBlobs, deserialize } from './serialize.mjs'
import { getClient } from './adapter.mjs'

const invoke = async (module, method, params) => {
    const client = getClient(settings.useFetch)
    client.setProgress(settings.download, settings.upload)

    const { json, blobs } = serializeWithBlobs({
        module,
        method,
        params,
        extra: settings.extra
    })
    const blobInfo = blobs.map(blob => {
        return {
            name: blob.name,
            size: blob.size,
            type: blob.type,
            lastModified: blob.lastModified
        }
    })

    let data
    if (blobInfo.length === 0) {
        client.setContentType('application/json')
        data = json
    } else {
        client.setContentType('application/octet-stream')
        const newJson = serialize({
            module,
            method,
            params,
            extra: settings.extra,
            blobInfo
        })
        client.setHeader('X-Simple-Rpc-Params', encodeURIComponent(newJson))
        data = new Blob([...blobs])
    }
    try {
        const responseText = await client.send(
            `${settings.host}/api/rpc`,
            'POST',
            data
        )
        if (responseText) {
            return deserialize(responseText)
        }
    } catch (e) {
        if (e instanceof Error) {
            throw e
        }
        throw deserialize(e)
    }
}

export const settings = {
    host: '',
    extra: {},
    upload: null,
    useFetch: false,
    download: null
}

export const file = async path => {
    if (typeof window !== 'undefined') {
        throw Error('Not supported in browser')
    }
    let fsps = null
    if (typeof require !== 'undefined') {
        fsps = require('fs').promises
    } else {
        fsps = (await import('fs')).promises
    }

    const buffer = await fsps.readFile(path)
    const stat = await fsps.stat(path)
    const name = path.split('/').pop()
    const lastModified = stat.mtime.getTime()

    return new File([buffer], name, {
        lastModified
    })
}

const factory = chain => {
    const f = () => {}
    f.chain = chain

    return f
}

const urlHandler = {
    get: (target, prop) => {
        const newChain = [...target.chain, prop]
        return new Proxy(factory(newChain), urlHandler)
    },
    apply: (target, _this, params) => {
        if (target.chain.length < 2) {
            throw new Error('Invalid length')
        }
        const module = [...target.chain]
        const method = module.pop()
        const json = serialize({
            module,
            method,
            params,
            extra: settings.extra
        })
        return `${settings.host}/api/rpc/${encodeURIComponent(json)}`
    }
}

const url = new Proxy({ chain: [] }, urlHandler)

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

export default client

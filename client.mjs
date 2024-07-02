import { serialize, serializeWithBlobs, deserialize } from './serialize.mjs'

const invoke = async (module, method, params) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${settings.host}/api/rpc`, true)
        xhr.onprogress = event => {
            if (
                event.lengthComputable &&
                typeof settings.download === 'function'
            ) {
                settings.download(event.loaded, event.total)
            }
        }
        xhr.upload.addEventListener('progress', event => {
            if (
                event.lengthComputable &&
                typeof settings.upload === 'function'
            ) {
                settings.upload(event.loaded, event.total)
            }
        })
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
        if (blobInfo.length === 0) {
            xhr.setRequestHeader('Content-Type', 'application/json')
            xhr.send(json)
        } else {
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')
            const newJson = serialize({
                module,
                method,
                params,
                extra: settings.extra,
                blobInfo
            })
            xhr.setRequestHeader(
                'X-Simple-Rpc-Params',
                encodeURIComponent(newJson)
            )
            xhr.send(new Blob([...blobs]))
        }
        xhr.onload = () => {
            if (xhr.status === 204) {
                resolve()
            } else if (xhr.status === 200) {
                resolve(deserialize(xhr.responseText))
            } else {
                reject(deserialize(xhr.responseText))
            }
        }
    })
}

const settings = {
    host: '',
    extra: {},
    upload: null,
    download: null
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

const clientHander = {
    get: (target, prop) => {
        if (prop === 'settings') {
            return settings
        }
        if (prop === 'url') {
            return url
        }
        const newChain = [...target.chain, prop]
        return new Proxy(factory(newChain), clientHander)
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

const client = new Proxy({ settings, chain: [] }, clientHander)

export default client

globalThis.client = client

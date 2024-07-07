'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const basic = [
    {
        type: 'string',
        check: value => typeof value === 'string',
        serialize: value => value,
        deserialize: value => value
    },
    {
        type: 'inf',
        check: value => value === Infinity || value === -Infinity,
        serialize: value => value > 0,
        deserialize: value => (value ? Infinity : -Infinity)
    },
    {
        type: 'nan',
        check: value => Number.isNaN(value),
        serialize: () => null,
        deserialize: () => NaN
    },
    {
        type: 'number',
        check: value => typeof value === 'number',
        serialize: value => value,
        deserialize: value => value
    },
    {
        type: 'boolean',
        check: value => typeof value === 'boolean',
        serialize: value => value,
        deserialize: value => value
    },
    {
        type: 'null',
        check: value => value === null,
        serialize: () => null,
        deserialize: () => null
    },
    {
        type: 'undefined',
        check: value => typeof value === 'undefined',
        serialize: () => null,
        deserialize: () => undefined
    },
    {
        type: 'date',
        check: value => value instanceof Date,
        serialize: value => value.getTime(),
        deserialize: value => new Date(value)
    },
    {
        type: 'regexp',
        check: value => value instanceof RegExp,
        serialize: value => ({ source: value.source, flags: value.flags }),
        deserialize: value => new RegExp(value.source, value.flags)
    },
    {
        type: 'error',
        check: value => value instanceof Error,
        serialize: value => ({
            message: value.message,
            name: value.name,
            stack: value.stack,
            type: value.constructor.name
        }),
        deserialize: value => {
            const e = globalThis[value.type](value.message);
            e.name = value.name;
            e.stack = value.stack;
            return e
        }
    },
    {
        type: 'bigint',
        check: value => typeof value === 'bigint',
        serialize: value => value.toString(),
        deserialize: value => BigInt(value)
    },
    {
        type: 'symbol',
        check: value => typeof value === 'symbol',
        serialize: value => value.description,
        deserialize: value => Symbol(value)
    },
    {
        type: 'function',
        check: value => typeof value === 'function',
        serialize: () => null,
        deserialize: () => () => {}
    }
];

let id = 0;
let cache;
let blobList;

const toBasicObject = obj => {
    id = 0;
    cache = new WeakMap();
    blobList = [];
    const basicObject = _toBasicObject(obj);
    cache = null;
    return basicObject
};

const _toBasicObject = obj => {
    if (cache.has(obj)) {
        return {
            refer: cache.get(obj),
            type: 'circular'
        }
    }

    const i = basic.findIndex(type => type.check(obj));
    if (i >= 0) {
        return {
            type: basic[i].type,
            value: basic[i].serialize(obj)
        }
    }

    if (obj instanceof Blob) {
        if (blobList.includes(obj)) {
            return {
                refer: blobList.indexOf(obj),
                type: 'blob'
            }
        }
        const ret = {
            refer: blobList.length,
            type: 'blob'
        };
        blobList.push(obj);
        return ret
    }

    if (Array.isArray(obj)) {
        const currentId = id++;
        cache.set(obj, currentId);
        const value = {};
        for (const idx in obj) {
            value[idx] = _toBasicObject(obj[idx]);
        }
        const ret = {
            id: currentId,
            type: 'array',
            value
        };

        return ret
    }

    if (obj instanceof Set) {
        const currentId = id++;
        cache.set(obj, currentId);
        const value = [];
        for (const item of obj) {
            value.push(_toBasicObject(item));
        }
        const ret = {
            id: currentId,
            type: 'set',
            value
        };
        return ret
    }

    if (obj instanceof Map) {
        const currentId = id++;
        cache.set(obj, currentId);
        const value = [];
        for (const [key, item] of obj) {
            value.push({
                key: _toBasicObject(key),
                item: _toBasicObject(item)
            });
        }
        const ret = {
            id: currentId,
            type: 'map',
            value
        };
        return ret
    }

    if (obj instanceof Object) {
        const currentId = id++;
        cache.set(obj, currentId);
        const value = {};
        for (const key in obj) {
            value[key] = _toBasicObject(obj[key]);
        }
        const ret = {
            id: currentId,
            type: 'object',
            value
        };
        return ret
    }
};

const _revert = obj => {
    if (obj.type === 'circular') {
        obj.tag = '__circular__neko__simple__rpc__';
        return obj
    }

    let hasId = typeof obj.id === 'number';
    const id = obj.id;

    const i = basic.findIndex(type => type.type === obj.type);
    if (i >= 0) {
        return basic[i].deserialize(obj.value)
    }

    if (obj.type === 'blob') {
        return {
            ...obj,
            tag: '__blob__neko__simple__rpc__'
        }
    }

    if (obj.type === 'array') {
        const value = [];
        for (const k in obj.value) {
            value[+k] = _revert(obj.value[k]);
        }
        if (hasId) {
            cache.set(id, value);
        }
        return value
    }

    if (obj.type === 'set') {
        const value = new Set();
        for (const item of obj.value) {
            value.add(_revert(item));
        }
        if (hasId) {
            cache.set(id, value);
        }
        return value
    }

    if (obj.type === 'map') {
        const value = new Map();
        for (const item of obj.value) {
            value.set(_revert(item.key), _revert(item.item));
        }
        if (hasId) {
            cache.set(id, value);
        }
        return value
    }

    if (obj.type === 'object') {
        const value = {};
        for (const key in obj.value) {
            value[key] = _revert(obj.value[key]);
        }
        if (hasId) {
            cache.set(id, value);
        }
        return value
    }
};

const isNotLinked = obj => {
    return (
        typeof obj === 'object' &&
        typeof obj?.refer === 'number' &&
        obj.tag === '__circular__neko__simple__rpc__' &&
        obj.type === 'circular'
    )
};

const setRef = obj => {
    if (basic.some(item => item.check(obj))) {
        return obj
    }

    if (isNotLinked(obj)) {
        return cache.get(obj.refer)
    }

    if (Array.isArray(obj)) {
        for (const k in obj) {
            obj[k] = setRef(obj[k]);
        }

        return obj
    }

    if (obj instanceof Set) {
        const s = new Set();
        for (const item of obj) {
            s.add(setRef(item));
        }
        obj.clear();
        for (const item of s) {
            obj.add(item);
        }

        return obj
    }

    if (obj instanceof Map) {
        const m = new Map();
        for (const [key, item] of obj) {
            m.set(setRef(key), setRef(item));
        }
        obj.clear();
        for (const [key, item] of m) {
            obj.set(key, item);
        }

        return obj
    }

    if (typeof obj === 'object') {
        for (const k in obj) {
            obj[k] = setRef(obj[k]);
        }

        return obj
    }
};

const revert = obj => {
    cache = new Map();
    const r = _revert(obj);
    setRef(r);
    cache = null;
    return r
};

const serializeWithBlobs = obj => {
    return {
        json: serialize(obj),
        blobs: blobList
    }
};

const serialize = obj => {
    return JSON.stringify(toBasicObject(obj))
};

const deserialize = str => {
    return revert(JSON.parse(str))
};

class XHRClient {
    constructor() {
        this.xhr = new XMLHttpRequest();
        this.headers = {};
    }

    async setContentType(contentType) {
        this.headers['Content-Type'] = contentType;
    }

    async setHeader(name, val) {
        this.headers[name] = val;
    }

    async setProgress(download, upload) {
        if (typeof download === 'function') {
            this.xhr.onprogress = event => {
                if (event.lengthComputable) {
                    download(event.loaded, event.total);
                }
            };
        }
        if (typeof upload === 'function') {
            this.xhr.upload.addEventListener('progress', event => {
                if (event.lengthComputable) {
                    upload(event.loaded, event.total);
                }
            });
        }
    }

    async send(url, method, body) {
        this.xhr.open(method, url, true);

        for (const name in this.headers) {
            this.xhr.setRequestHeader(name, this.headers[name]);
        }

        this.xhr.send(body);

        return new Promise((resolve, reject) => {
            this.xhr.onload = () => {
                if (this.xhr.status === 204) {
                    resolve();
                } else if (this.xhr.status === 200) {
                    resolve(this.xhr.responseText);
                } else {
                    reject(this.xhr.responseText);
                }
            };
        })
    }
}

class FetchClient {
    constructor() {
        this.headers = {};
    }

    async setContentType(contentType) {
        this.headers['Content-Type'] = contentType;
    }

    async setHeader(name, val) {
        this.headers[name] = val;
    }

    async setProgress(download, upload) {
        if (typeof download === 'function') {
            this.download = download;
        }
    }

    async send(url, method, body) {
        const response = await fetch(url, {
            method,
            body,
            headers: this.headers
        });

        if (response.status === 204) {
            return
        }

        const reader = response.body.getReader();
        const total = parseInt(response.headers.get('Content-Length'));
        let loaded = 0;
        let responseText = '';
        const textDecoder = new TextDecoder('utf-8');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break
            loaded += value.length;
            if (this.download) {
                this.download(loaded, total);
            }

            responseText += textDecoder.decode(value);
        }

        if (response.status === 200) {
            return responseText
        }
        throw responseText
    }
}

class HttpRequestClient {
    constructor() {
        this.headers = {};
    }

    async setContentType(contentType) {
        this.headers['Content-Type'] = contentType;
    }

    async setHeader(name, val) {
        this.headers[name] = val;
    }

    async setProgress(download, upload) {
        if (typeof download === 'function') {
            this.download = download;
        }

        if (typeof upload === 'function') {
            this.upload = upload;
        }
    }

    async send(url, method, body) {
        let resolve, reject;
        const ps = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });

        let protocol = null;
        if (url.startsWith('https:')) {
            protocol = 'https';
        } else if (url.startsWith('http:')) {
            protocol = 'http';
        } else {
            throw Error('Unsupported protocol')
        }
        let request;
        if (typeof require === 'function') {
            request = require('request').request;
        } else {
            request = (await import(protocol)).request;
        }

        const urlObject = new URL(url);
        this.headers['Content-Length'] =
            body instanceof Blob ? body.size : Buffer.byteLength(body);

        const options = {
            path: urlObject.pathname + urlObject.search,
            method,
            hostname: urlObject.hostname,
            port: urlObject.port,
            headers: this.headers
        };

        const req = request(options, res => {
            let responseData = '';
            let receivedBytes = 0;
            const contentLength = parseInt(res.headers['content-length'], 10);

            if (res.statusCode === 204) {
                resolve();
                return
            }

            res.on('data', chunk => {
                receivedBytes += chunk.length;
                if (this.download) {
                    this.download(receivedBytes, contentLength);
                }
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(responseData);
                } else {
                    reject(responseData);
                }
            });
        });

        if (body instanceof Blob) {
            body.arrayBuffer().then(buffer => {
                req.write(Buffer.from(buffer));
                req.end();
            });
        } else {
            req.write(body, () => {
                req.end();
            });
        }

        return ps
    }
}

const getClient = useFetch => {
    let client;
    if (useFetch) {
        client = new FetchClient();
    } else {
        if (typeof XMLHttpRequest !== 'undefined') {
            client = new XHRClient();
        } else {
            client = new HttpRequestClient();
        }
    }
    return client
};

const invoke = async (module, method, params) => {
    const client = getClient(settings.useFetch);
    client.setProgress(settings.download, settings.upload);

    const { json, blobs } = serializeWithBlobs({
        module,
        method,
        params,
        extra: settings.extra
    });
    const blobInfo = blobs.map(blob => {
        return {
            name: blob.name,
            size: blob.size,
            type: blob.type,
            lastModified: blob.lastModified
        }
    });

    let data;
    if (blobInfo.length === 0) {
        client.setContentType('application/json');
        data = json;
    } else {
        client.setContentType('application/octet-stream');
        const newJson = serialize({
            module,
            method,
            params,
            extra: settings.extra,
            blobInfo
        });
        client.setHeader('X-Simple-Rpc-Params', encodeURIComponent(newJson));
        data = new Blob([...blobs]);
    }
    try {
        const responseText = await client.send(
            `${settings.host}/api/rpc`,
            'POST',
            data
        );
        if (responseText) {
            return deserialize(responseText)
        }
    } catch (e) {
        throw deserialize(e)
    }
};

const settings = {
    host: '',
    extra: {},
    upload: null,
    useFetch: false,
    download: null
};

const file = async (path) => {
    if (typeof window !== 'undefined') {
        throw Error('Not supported in browser')
    }
    let fsps = null;
    if (typeof require !== 'undefined') {
        fsps = require('fs').promises;
    } else {
        fsps = (await import('fs')).promises;
    }

    const buffer = await fsps.readFile(path);
    const stat = await fsps.stat(path);
    const name = path.split('/').pop();
    const lastModified = stat.mtime.getTime();

    return new File([buffer], name, {
        lastModified
    })
};

const factory = chain => {
    const f = () => {};
    f.chain = chain;

    return f
};

const urlHandler = {
    get: (target, prop) => {
        const newChain = [...target.chain, prop];
        return new Proxy(factory(newChain), urlHandler)
    },
    apply: (target, _this, params) => {
        if (target.chain.length < 2) {
            throw new Error('Invalid length')
        }
        const module = [...target.chain];
        const method = module.pop();
        const json = serialize({
            module,
            method,
            params,
            extra: settings.extra
        });
        return `${settings.host}/api/rpc/${encodeURIComponent(json)}`
    }
};

const url = new Proxy({ chain: [] }, urlHandler);

const clientHander = {
    get: (target, prop) => {
        if (prop === 'settings') {
            return settings
        }
        if (prop === 'url') {
            return url
        }
        const newChain = [...target.chain, prop];
        return new Proxy(factory(newChain), clientHander)
    },
    apply: async (target, _this, params) => {
        if (target.chain.length < 2) {
            throw new Error('Invalid length')
        }
        const module = [...target.chain];
        const method = module.pop();

        return await invoke(module, method, params)
    }
};

const client = new Proxy({ settings, chain: [] }, clientHander);

exports.default = client;
exports.file = file;
exports.settings = settings;

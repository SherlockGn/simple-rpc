'use strict';

var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var stream = require('stream');

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

const serialize = obj => {
    return JSON.stringify(toBasicObject(obj))
};

const deserialize = str => {
    return revert(JSON.parse(str))
};

const replace = (obj, check, replacer) => {
    if (check(obj)) {
        return replacer(obj)
    }

    if (basic.some(item => item.check(obj))) {
        return obj
    }

    if (Array.isArray(obj)) {
        for (const k in obj) {
            obj[k] = replace(obj[k], check, replacer);
        }

        return obj
    }

    if (obj instanceof Set) {
        const s = new Set();
        for (const item of obj) {
            s.add(replace(item, check, replacer));
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
            m.set(replace(key, check, replacer), replace(item, check, replacer));
        }
        obj.clear();
        for (const [key, item] of m) {
            obj.set(key, item);
        }

        return obj
    }

    if (typeof obj === 'object') {
        for (const k in obj) {
            obj[k] = replace(obj[k], check, replacer);
        }

        return obj
    }
};

const getBody = async req => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            resolve(body);
        });
        req.on('error', err => {
            reject(err);
        });
    })
};

const validateRpcString = (string, ctx) => {
    const {
        module,
        method,
        params,
        extra = {},
        blobInfo = null
    } = deserialize(string);

    if (
        !Array.isArray(module) ||
        module.some(m => typeof m !== 'string') ||
        module.some(m => !/^[a-zA-Z0-9]+$/.test(m)) ||
        typeof method !== 'string'
    ) {
        throw new Error('invalid request')
    }

    if (!Array.isArray(params)) {
        throw new Error('invalid request')
    }

    ctx.module = module;
    ctx.method = method;
    ctx.params = params;
    ctx.blobInfo = blobInfo;
    ctx.extra = extra;
};

const mimeTypes = new Map([
    ['html', 'text/html'],
    ['htm', 'text/html'],
    ['css', 'text/css'],
    ['js', 'application/javascript'],
    ['mjs', 'application/javascript'],
    ['json', 'application/json'],
    ['xml', 'application/xml'],
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['png', 'image/png'],
    ['gif', 'image/gif'],
    ['bmp', 'image/bmp'],
    ['webp', 'image/webp'],
    ['svg', 'image/svg+xml'],
    ['txt', 'text/plain'],
    ['pdf', 'application/pdf'],
    ['doc', 'application/msword'],
    [
        'docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    ['xls', 'application/vnd.ms-excel'],
    [
        'xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    ['ppt', 'application/vnd.ms-powerpoint'],
    [
        'pptx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    ['mp3', 'audio/mpeg'],
    ['wav', 'audio/wav'],
    ['ogg', 'audio/ogg'],
    ['flac', 'audio/flac'],
    ['mp4', 'video/mp4'],
    ['mkv', 'video/x-matroska'],
    ['avi', 'video/x-msvideo'],
    ['mov', 'video/quicktime'],
    ['wmv', 'video/x-ms-wmv'],
    ['webm', 'video/webm'],
    ['zip', 'application/zip'],
    ['rar', 'application/vnd.rar'],
    ['tar', 'application/x-tar'],
    ['gz', 'application/gzip'],
    ['7z', 'application/x-7z-compressed'],
    ['iso', 'application/x-iso9660-image'],
    ['epub', 'application/epub+zip'],
    ['mobi', 'application/x-mobipocket-ebook'],
    ['csv', 'text/csv'],
    ['md', 'text/markdown'],
    ['ics', 'text/calendar'],
    ['rtf', 'application/rtf'],
    ['sh', 'application/x-sh'],
    ['php', 'application/x-httpd-php'],
    ['jsonld', 'application/ld+json'],
    ['yaml', 'application/x-yaml'],
    ['yml', 'application/x-yaml'],
    ['wasm', 'application/wasm']
]);

const maxRangeSize = 10 * 1024 * 1024;
const getStream = (file, size, range) => {
    const ext = typeof file === 'string' ? file.split('.').pop() : null;
    const mime = mimeTypes.get(ext) ?? 'octet-stream';
    let header;
    let stream;
    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = Math.min(size - 1, start + maxRangeSize - 1);
        header = {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Type': mime
        };
        if (typeof file === 'string') {
            stream = fs.createReadStream(file, {
                start,
                end
            });
        }
        if (file instanceof Buffer) {
            stream = bufferToStream(file, start, end);
        }
    } else {
        header = {
            'Content-Type': mime
        };
        if (typeof file === 'string') {
            stream = fs.createReadStream(file);
        }
        if (file instanceof Buffer) {
            stream = bufferToStream(file);
        }
    }
    return {
        header,
        stream
    }
};

const splitStream = (readable, lengths) => {
    const streams = lengths.map(() => new stream.PassThrough());
    let currentStreamIndex = 0;
    let remainingLength = lengths[currentStreamIndex];
    let totalLength = lengths.reduce((acc, length) => acc + length, 0);
    let totalWritten = 0;

    readable.on('data', chunk => {
        if (totalWritten >= totalLength) {
            return
        }

        let offset = 0;
        while (offset < chunk.length) {
            const remainingChunkLength = chunk.length - offset;
            const toWrite = Math.min(
                remainingLength,
                remainingChunkLength,
                totalLength - totalWritten
            );

            streams[currentStreamIndex].write(
                chunk.slice(offset, offset + toWrite)
            );
            remainingLength -= toWrite;
            totalWritten += toWrite;
            offset += toWrite;

            if (remainingLength === 0) {
                streams[currentStreamIndex].end();
                currentStreamIndex++;
                if (currentStreamIndex < streams.length) {
                    remainingLength = lengths[currentStreamIndex];
                } else {
                    readable.pause();
                    return
                }
            }

            if (totalWritten >= totalLength) {
                streams.forEach((stream, index) => {
                    if (!stream._writableState.ended) {
                        stream.end();
                    }
                });
                readable.pause();
                return
            }
        }
    });

    readable.on('end', () => {
        streams.forEach((stream, index) => {
            if (!stream._writableState.ended) {
                stream.end();
            }
        });
    });

    return streams
};

const bufferToStream = (buffer, start = 0, end = buffer.length) => {
    class BufferStream extends stream.Readable {
        constructor(buffer, options = {}) {
            super(options);
            this.buffer = buffer;
            this.start = start;
            this.end = end;
            this.position = this.start;
        }

        _read(size) {
            if (this.position >= this.end) {
                this.push(null);
                return
            }

            const chunkSize = Math.min(size, this.end - this.position);
            const chunk = this.buffer.slice(
                this.position,
                this.position + chunkSize
            );
            this.push(chunk);
            this.position += chunkSize;
        }
    }

    return new BufferStream(buffer)
};

const header = async (req, ctx, settings) => {
    if (!settings.rpcFolder) {
        return
    }

    if (req.method !== 'POST') {
        return
    }

    const paramHeader = req.headers['X-Simple-Rpc-Params'.toLowerCase()];
    if (!paramHeader) {
        return
    }

    if (ctx.type) {
        return
    }

    const body = decodeURIComponent(paramHeader);
    validateRpcString(body, ctx);

    ctx.type = 'header';
};

const post = async (req, ctx, settings) => {
    if (!settings.rpcFolder) {
        return
    }

    if (req.method !== 'POST') {
        return
    }

    if (ctx.type) {
        return
    }

    const body = await getBody(req);
    validateRpcString(body, ctx);

    ctx.type = 'post';
};

const get = async (req, ctx, settings) => {
    if (!settings.rpcFolder) {
        return
    }

    if (req.method !== 'GET') {
        return
    }

    const prefix = '/api/rpc/';
    if (!req.url.startsWith(prefix)) {
        return
    }

    if (ctx.type) {
        return
    }

    const body = decodeURIComponent(req.url.substr(prefix.length));
    validateRpcString(body, ctx);

    ctx.type = 'get';
};

const entry = async (ctx, settings) => {
    if (!ctx.module) {
        return
    }

    const path$1 = path.join(settings.rpcFolder, ctx.module.join(path.sep));

    const exts = ['.js', '.mjs', '.cjs'];
    let mod = null;

    for (const ext of exts) {
        try {
            if (typeof require === 'undefined') {
                mod = await import(path$1 + ext);
            } else {
                mod = require(path$1 + ext);
            }
            break
        } catch (e) {
            if (e.code !== 'ERR_MODULE_NOT_FOUND' && e.code !== 'MODULE_NOT_FOUND') {
                console.warn(e.message);
            }
        }
    }

    if (typeof mod !== 'object' || mod === null) {
        throw new Error('module not found')
    }

    if (!Object.getOwnPropertyNames(mod).includes(ctx.method)) {
        throw new Error('method not found')
    }

    const entry = mod[ctx.method];

    if (typeof entry !== 'function') {
        throw new Error('method not found')
    }

    ctx.entry = entry;
};

const execute = async (req, ctx) => {
    if (!ctx.entry) {
        return
    }

    let params;
    if (ctx.blobInfo) {
        const streams = splitStream(
            req,
            ctx.blobInfo.map(i => i.size)
        );

        params = replace(
            ctx.params,
            o =>
                typeof o === 'object' &&
                o?.type === 'blob' &&
                o?.tag === '__blob__neko__simple__rpc__',
            o => ({ ...ctx.blobInfo[o.refer], stream: streams[o.refer] })
        );
    } else {
        params = ctx.params;
    }

    ctx.result = await ctx.entry.bind(ctx)(...params);
};

const process = async (req, ctx, settings) => {
    if (!settings.staticFolder) {
        return
    }

    const url = req.url;
    const paths = url.split('/').filter(i => i.length > 0);

    let target = path.join(settings.staticFolder, ...paths);

    try {
        let stat = await fs.promises.stat(target);
        if (!stat.isFile()) {
            target = path.join(target, 'index.html');
            stat = await fs.promises.stat(target);
        }

        const { header, stream } = getStream(target, stat.size, req.headers.range);

        ctx.type = 'static';
        ctx.header = header;
        ctx.stream = stream;
    } catch (error) {
        return
    }
};

function FileRsp(obj) {
    if (!(this instanceof FileRsp)) {
        return new FileRsp(obj)
    }
    this.obj = obj;
}

FileRsp.prototype.toStream = async function (range) {
    if (typeof this.obj === 'string') {
        const stat = await fs.promises.stat(this.obj);
        const size = stat.size;

        return getStream(this.obj, size, range)
    }

    if (this.obj instanceof Buffer) {
        return getStream(this.obj, this.obj.length, range)
    }
};

const response = async (req, res, ctx) => {
    if (ctx.notfound) {
        res.statusCode = 404;
        res.end();
        return
    }

    if (ctx.error) {
        res.statusCode = 500;
        res.end(serialize(ctx.error));

        return
    }

    try {
        if (ctx.entry) {
            if (ctx.result === undefined) {
                res.statusCode = 204;
                res.end();

                return
            }

            if (ctx.result instanceof FileRsp) {
                const s = await ctx.result.toStream(req.headers.range);
                ctx.stream = s.stream;
                ctx.header = s.header;
            } else {
                res.statusCode = ctx.result === undefined ? 204 : 200;
                res.end(serialize(ctx.result));

                return
            }
        }

        if (ctx.header) {
            for (const k in ctx.header) {
                res.setHeader(k, ctx.header[k]);
            }
        }

        if (ctx.stream) {
            res.statusCode = 206;
            ctx.stream.pipe(res);

            return
        }
    } catch (error) {
        res.statusCode = 500;
        res.end(serialize(error));

        return
    }
};

const handler = async (req, res) => {
    const ctx = {
        state: {}
    };

    if (await settings.plugin(req, res, ctx)) {
        return
    }

    if (settings.cors.origins) {
        res.setHeader('Access-Control-Allow-Origin', settings.cors.origins);
    }
    if (settings.cors.methods) {
        res.setHeader('Access-Control-Allow-Methods', settings.cors.methods);
    }
    if (settings.cors.headers) {
        res.setHeader('Access-Control-Allow-Headers', settings.cors.headers);
    }
    if (settings.cors.credential) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS' && settings.cors.origins) {
        res.statusCode = 200;
        res.end();
        return
    }

    try {
        await header(req, ctx, settings);
        await post(req, ctx, settings);
        await get(req, ctx, settings);
        await entry(ctx, settings);

        if (ctx.entry && settings.authHandler) {
            await settings.authHandler(ctx);
        }

        await execute(req, ctx);

        if (ctx.type) {
            return
        }

        await process(req, ctx, settings);

        if (ctx.type) {
            return
        }

        ctx.notfound = true;
    } catch (error) {
        if (!(error instanceof Error)) {
            error = Error(error.toString());
        }
        ctx.error = error;
        if (settings.errorHandler) {
            await settings.errorHandler(ctx, error);
        }
    } finally {
        if (ctx.type !== 'static' && settings.endHandler) {
            await settings.endHandler(ctx);
        }

        await response(req, res, ctx);
    }
};

const settings = {
    cors: {
        origins: null,
        methods: null,
        headers: null,
        credential: false
    },
    plugin: async () => {},
    protocol: null,
    authHandler: null,
    endHandler: null,
    errorHandler: null,
    rpcFolder: null,
    staticFolder: null
};

const useProtocol = protocol => {
    if (protocol !== 'http' && protocol !== 'https' && protocol !== null) {
        throw new Error('Invalid protocol')
    }
    settings.protocol = protocol;
};

const usePlugin = plugin => {
    settings.plugin = plugin;
};

const useAuth = handler => {
    settings.authHandler = handler;
};

const useEnd = handler => {
    settings.endHandler = handler;
};

const useError = handler => {
    settings.errorHandler = handler;
};

const useRpc = folder => {
    settings.rpcFolder = path.resolve(folder);
};

const useStatic = folder => {
    settings.staticFolder = path.resolve(folder);
};

const useCors = (options = '*') => {
    if (typeof options === 'string') {
        options = {
            origins: options
        };
    }
    const {
        origins = '*',
        methods = '*',
        headers = 'Content-Type, Authorization, Pragma, Cache-Control, X-Requested-With, X-Simple-Rpc-Params',
        credential = true
    } = options;
    settings.cors.origins = origins;
    settings.cors.methods = methods;
    settings.cors.headers = headers;
    settings.cors.credential = credential;
};

const createServer = options => {
    options = { ...options };
    if (!options.port) {
        options.port = 8080;
    }

    let protocol = null;
    if (!settings.protocol) {
        const { key = null, cert = null } = options;
        const useHttps = key && cert;
        protocol = useHttps ? https : http;
    } else if (settings.protocol === 'http') {
        protocol = http;
    } else if (settings.protocol === 'https') {
        protocol = https;
    }
    options.protocol = protocol;

    const server = protocol.createServer(options, handler);

    return {
        server,
        options,
        useProtocol,
        usePlugin,
        useCors,
        useAuth,
        useEnd,
        useError,
        useRpc,
        useStatic,
        close: () => server.close(),
        start: async () => {
            return new Promise((resolve, reject) => {
                server.on('error', e => reject(e));
                server.listen(options, resolve);
            })
        }
    }
};

exports.FileRsp = FileRsp;
exports.createServer = createServer;
exports.deserialize = deserialize;
exports.serialize = serialize;

import http from 'http'
import https from 'https'

import { resolve } from 'path'

import * as rpc from './rpc.mjs'
import * as st from './static.mjs'
import { response } from './rsp.mjs'
import FileRsp from './FileRsp.mjs'

export { FileRsp }

const handler = async (req, res) => {
    if (settings.plugin(req, res)) {
        return
    }

    if (settings.cors.origins) {
        res.setHeader('Access-Control-Allow-Origin', settings.cors.origins)
    }
    if (settings.cors.methods) {
        res.setHeader('Access-Control-Allow-Methods', settings.cors.methods)
    }
    if (settings.cors.headers) {
        res.setHeader('Access-Control-Allow-Headers', settings.cors.headers)
    }
    if (settings.cors.credential) {
        res.setHeader('Access-Control-Allow-Credentials', 'true')
    }

    if (req.method === 'OPTIONS' && settings.cors.origins) {
        res.statusCode = 200
        res.end()
        return
    }

    const ctx = {
        state: {}
    }

    try {
        await rpc.header(req, ctx, settings)
        await rpc.post(req, ctx, settings)
        await rpc.get(req, ctx, settings)
        await rpc.entry(ctx, settings)

        if (ctx.entry && settings.authHandler) {
            await settings.authHandler(ctx)
        }

        await rpc.execute(req, ctx)

        if (ctx.type) {
            return
        }

        await st.process(req, ctx, settings)

        if (ctx.type) {
            return
        }

        ctx.notfound = true
    } catch (error) {
        if (!(error instanceof Error)) {
            error = Error(error.toString())
        }
        ctx.error = error
        if (settings.errorHandler) {
            await settings.errorHandler(ctx, error)
        }
    } finally {
        if (ctx.type !== 'static' && settings.endHandler) {
            await settings.endHandler(ctx)
        }

        await response(req, res, ctx)
    }
}

const settings = {
    cors: {
        origins: null,
        methods: null,
        headers: null,
        credential: false
    },
    plugin: () => {},
    protocol: null,
    authHandler: null,
    endHandler: null,
    errorHandler: null,
    rpcFolder: null,
    staticFolder: null
}

const useProtocol = protocol => {
    if (protocol !== 'http' && protocol !== 'https' && protocol !== null) {
        throw new Error('Invalid protocol')
    }
    settings.protocol = protocol
}

const usePlugin = plugin => {
    settings.plugin = plugin
}

const useAuth = handler => {
    settings.authHandler = handler
}

const useEnd = handler => {
    settings.endHandler = handler
}

const useError = handler => {
    settings.errorHandler = handler
}

const useRpc = folder => {
    settings.rpcFolder = resolve(folder)
}

const useStatic = folder => {
    settings.staticFolder = resolve(folder)
}

const useCors = (options = '*') => {
    if (typeof options === 'string') {
        options = {
            origins: options
        }
    }
    const {
        origins = '*',
        methods = '*',
        headers = 'Content-Type, Authorization, Pragma, Cache-Control, X-Requested-With, X-Simple-Rpc-Params',
        credential = true
    } = options
    settings.cors.origins = origins
    settings.cors.origins = origins
    settings.cors.methods = methods
    settings.cors.headers = headers
    settings.cors.credential = credential
}

export const createServer = options => {
    options = { ...options }
    if (!options.port) {
        options.port = 8080
    }

    let protocol = null
    if (!settings.protocol) {
        const { key = null, cert = null } = options
        const useHttps = key && cert
        protocol = useHttps ? https : http
    } else if (settings.protocol === 'http') {
        protocol = http
    } else if (settings.protocol === 'https') {
        protocol = https
    }

    const server = protocol.createServer(handler, options)

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
                server.on('error', e => reject(e))
                server.listen(options, resolve)
            })
        }
    }
}

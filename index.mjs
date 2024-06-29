import http from 'http'
import https from 'https'

import { resolve } from 'path'

import * as rpc from './rpc.mjs'
import * as st from './static.mjs'
import { response } from './rsp.mjs'
import FileRsp from './FileRsp.mjs'

export { FileRsp }

const handler = async (req, res) => {
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
    authHandler: null,
    endHandler: null,
    errorHandler: null,
    rpcFolder: null,
    staticFolder: null
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

export const createServer = options => {
    const {
        port = 8080,
        hostname = '0.0.0.0',
        key = null,
        cert = null
    } = { ...options }

    const useHttps = key && cert
    const module = useHttps ? https : http

    const server = module.createServer(handler, options)

    return {
        server,
        options,
        useAuth,
        useEnd,
        useError,
        useRpc,
        useStatic,
        close: () => server.close(),
        start: async () => {
            return new Promise((resolve, reject) => {
                server.on('error', e => reject(e))
                server.listen(port, hostname, resolve)
            })
        }
    }
}

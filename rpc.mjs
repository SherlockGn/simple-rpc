import { join, sep } from 'path'

import { getBody, validateRpcString, splitStream } from './utils.mjs'
import { replace } from './serialize.mjs'

export const header = async (req, ctx, settings) => {
    if (!settings.rpcFolder) {
        return
    }

    if (req.method !== 'POST') {
        return
    }

    const paramHeader = req.headers['X-Simple-Rpc-Params'.toLowerCase()]
    if (!paramHeader) {
        return
    }

    if (ctx.type) {
        return
    }

    const body = decodeURIComponent(paramHeader)
    validateRpcString(body, ctx)

    ctx.type = 'header'
}

export const post = async (req, ctx, settings) => {
    if (!settings.rpcFolder) {
        return
    }

    if (req.method !== 'POST') {
        return
    }

    if (ctx.type) {
        return
    }

    const body = await getBody(req)
    validateRpcString(body, ctx)

    ctx.type = 'post'
}

export const get = async (req, ctx, settings) => {
    if (!settings.rpcFolder) {
        return
    }

    if (req.method !== 'GET') {
        return
    }

    const prefix = '/api/rpc/'
    if (!req.url.startsWith(prefix)) {
        return
    }

    if (ctx.type) {
        return
    }

    const body = decodeURIComponent(req.url.substr(prefix.length))
    validateRpcString(body, ctx)

    ctx.type = 'get'
}

export const entry = async (ctx, settings) => {
    if (!ctx.module) {
        return
    }

    const path = join(settings.rpcFolder, ctx.module.join(sep))

    const exts = ['.js', '.mjs', '.cjs']
    let mod = null

    for (const ext of exts) {
        try {
            if (typeof require === 'undefined') {
                mod = await import(path + ext)
            } else {
                mod = require(path + ext)
            }
            break
        } catch (e) {
            if (e.code !== 'ERR_MODULE_NOT_FOUND' && e.code !== 'MODULE_NOT_FOUND') {
                console.warn(e.message)
            }
        }
    }

    if (typeof mod !== 'object' || mod === null) {
        throw new Error('module not found')
    }

    if (!Object.getOwnPropertyNames(mod).includes(ctx.method)) {
        throw new Error('method not found')
    }

    const entry = mod[ctx.method]

    if (typeof entry !== 'function') {
        throw new Error('method not found')
    }

    ctx.entry = entry
}

export const execute = async (req, ctx) => {
    if (!ctx.entry) {
        return
    }

    let params
    if (ctx.blobInfo) {
        const streams = splitStream(
            req,
            ctx.blobInfo.map(i => i.size)
        )

        params = replace(
            ctx.params,
            o =>
                typeof o === 'object' &&
                o?.type === 'blob' &&
                o?.tag === '__blob__neko__simple__rpc__',
            o => ({ ...ctx.blobInfo[o.refer], stream: streams[o.refer] })
        )
    } else {
        params = ctx.params
    }

    ctx.result = await ctx.entry.bind(ctx)(...params)
}

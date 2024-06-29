import FileRsp from './FileRsp.mjs'
import { serialize } from './serialize.mjs'

export const response = async (req, res, ctx) => {
    if (ctx.notfound) {
        res.statusCode = 404
        res.end()
        return
    }

    if (ctx.error) {
        res.statusCode = 500
        res.end(serialize(ctx.error))

        return
    }

    if (ctx.entry) {
        if (ctx.result === undefined) {
            res.statusCode = 204
            res.end()

            return
        }

        if (ctx.result instanceof FileRsp) {
            const s = await ctx.result.toStream(req.headers.range)
            ctx.stream = s.stream
            ctx.header = s.header
        } else {
            res.statusCode = ctx.result === undefined ? 204 : 200
            res.end(serialize(ctx.result))

            return
        }
    }

    if (ctx.header) {
        for (const k in ctx.header) {
            res.setHeader(k, ctx.header[k])
        }
    }

    if (ctx.stream) {
        res.statusCode = 206
        ctx.stream.pipe(res)

        return
    }
}

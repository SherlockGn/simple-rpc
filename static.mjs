import { join } from 'path'
import { promises as fs } from 'fs'

import { getStream } from './utils.mjs'

export const process = async (req, ctx, settings) => {
    if (!settings.staticFolder) {
        return
    }

    const url = req.url
    const paths = url.split('/').filter(i => i.length > 0)

    let target = join(settings.staticFolder, ...paths)

    try {
        let stat = await fs.stat(target)
        if (!stat.isFile()) {
            target = join(target, 'index.html')
            stat = await fs.stat(target)
        }

        const { header, stream } = getStream(target, stat.size, req.headers.range)

        ctx.type = 'static'
        ctx.header = header
        ctx.stream = stream
    } catch (error) {
        return
    }
}

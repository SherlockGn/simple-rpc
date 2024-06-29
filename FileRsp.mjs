import { promises as fs } from 'fs'

import { getStream } from './utils.mjs'

export default function FileRsp(obj) {
    if (!(this instanceof FileRsp)) {
        return new FileRsp(obj)
    }
    this.obj = obj
}

FileRsp.prototype.toStream = async function (range) {
    if (typeof this.obj === 'string') {
        const stat = await fs.stat(this.obj)
        const size = stat.size

        return getStream(this.obj, size, range)
    }

    if (this.obj instanceof Buffer) {
        return getStream(this.obj, this.obj.length, range)
    }
}

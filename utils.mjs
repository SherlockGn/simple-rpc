import { createReadStream } from 'fs'
import { PassThrough, Readable } from 'stream'
import { deserialize } from './serialize.mjs'

export const getBody = async req => {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            resolve(body)
        })
        req.on('error', err => {
            reject(err)
        })
    })
}

export const validateRpcString = (string, ctx) => {
    const {
        module,
        method,
        params,
        extra = {},
        blobInfo = null
    } = deserialize(string)

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

    ctx.module = module
    ctx.method = method
    ctx.params = params
    ctx.blobInfo = blobInfo
    ctx.extra = extra
}

export const mimeTypes = new Map([
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
])

const maxRangeSize = 10 * 1024 * 1024
export const getStream = (file, size, range) => {
    const ext = typeof file === 'string' ? file.split('.').pop() : null
    const mime = mimeTypes.get(ext) ?? 'octet-stream'
    let header
    let stream
    if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = Math.min(size - 1, start + maxRangeSize - 1)
        header = {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Type': mime
        }
        if (typeof file === 'string') {
            stream = createReadStream(file, {
                start,
                end
            })
        }
        if (file instanceof Buffer) {
            stream = bufferToStream(file, start, end)
        }
    } else {
        header = {
            'Content-Type': mime
        }
        if (typeof file === 'string') {
            stream = createReadStream(file)
        }
        if (file instanceof Buffer) {
            stream = bufferToStream(file)
        }
    }
    return {
        header,
        stream
    }
}

export const splitStream = (readable, lengths) => {
    const streams = lengths.map(() => new PassThrough())
    let currentStreamIndex = 0
    let remainingLength = lengths[currentStreamIndex]
    let totalLength = lengths.reduce((acc, length) => acc + length, 0)
    let totalWritten = 0

    readable.on('data', chunk => {
        if (totalWritten >= totalLength) {
            return
        }

        let offset = 0
        while (offset < chunk.length) {
            const remainingChunkLength = chunk.length - offset
            const toWrite = Math.min(
                remainingLength,
                remainingChunkLength,
                totalLength - totalWritten
            )

            streams[currentStreamIndex].write(
                chunk.slice(offset, offset + toWrite)
            )
            remainingLength -= toWrite
            totalWritten += toWrite
            offset += toWrite

            if (remainingLength === 0) {
                streams[currentStreamIndex].end()
                currentStreamIndex++
                if (currentStreamIndex < streams.length) {
                    remainingLength = lengths[currentStreamIndex]
                } else {
                    readable.pause()
                    return
                }
            }

            if (totalWritten >= totalLength) {
                streams.forEach((stream, index) => {
                    if (!stream._writableState.ended) {
                        stream.end()
                    }
                })
                readable.pause()
                return
            }
        }
    })

    readable.on('end', () => {
        streams.forEach((stream, index) => {
            if (!stream._writableState.ended) {
                stream.end()
            }
        })
    })

    return streams
}

const bufferToStream = (buffer, start = 0, end = buffer.length) => {
    class BufferStream extends Readable {
        constructor(buffer, options = {}) {
            super(options)
            this.buffer = buffer
            this.start = start
            this.end = end
            this.position = this.start
        }

        _read(size) {
            if (this.position >= this.end) {
                this.push(null)
                return
            }

            const chunkSize = Math.min(size, this.end - this.position)
            const chunk = this.buffer.slice(
                this.position,
                this.position + chunkSize
            )
            this.push(chunk)
            this.position += chunkSize
        }
    }

    return new BufferStream(buffer)
}

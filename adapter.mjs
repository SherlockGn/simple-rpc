class XHRClient {
    constructor() {
        this.xhr = new XMLHttpRequest()
        this.headers = {}
    }

    async setContentType(contentType) {
        this.headers['Content-Type'] = contentType
    }

    async setHeader(name, val) {
        this.headers[name] = val
    }

    async setProgress(download, upload) {
        if (typeof download === 'function') {
            this.xhr.onprogress = event => {
                if (event.lengthComputable) {
                    download(event.loaded, event.total)
                }
            }
        }
        if (typeof upload === 'function') {
            this.xhr.upload.addEventListener('progress', event => {
                if (event.lengthComputable) {
                    upload(event.loaded, event.total)
                }
            })
        }
    }

    async send(url, method, body) {
        this.xhr.open(method, url, true)

        for (const name in this.headers) {
            this.xhr.setRequestHeader(name, this.headers[name])
        }

        this.xhr.send(body)

        return new Promise((resolve, reject) => {
            this.xhr.onload = () => {
                if (this.xhr.status === 204) {
                    resolve()
                } else if (this.xhr.status === 200) {
                    resolve(this.xhr.responseText)
                } else {
                    reject(this.xhr.responseText)
                }
            }
        })
    }
}

class FetchClient {
    constructor() {
        this.headers = {}
    }

    async setContentType(contentType) {
        this.headers['Content-Type'] = contentType
    }

    async setHeader(name, val) {
        this.headers[name] = val
    }

    async setProgress(download, upload) {
        if (typeof download === 'function') {
            this.download = download
        }
    }

    async send(url, method, body) {
        const response = await fetch(url, {
            method,
            body,
            headers: this.headers
        })

        if (response.status === 204) {
            return
        }

        const reader = response.body.getReader()
        const total = parseInt(response.headers.get('Content-Length'))
        let loaded = 0
        let responseText = ''
        const textDecoder = new TextDecoder('utf-8')

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            loaded += value.length
            if (this.download) {
                this.download(loaded, total)
            }

            responseText += textDecoder.decode(value)
        }

        if (response.status === 200) {
            return responseText
        }
        throw responseText
    }
}

class HttpRequestClient {
    constructor() {
        this.headers = {}
    }

    async setContentType(contentType) {
        this.headers['Content-Type'] = contentType
    }

    async setHeader(name, val) {
        this.headers[name] = val
    }

    async setProgress(download, upload) {
        if (typeof download === 'function') {
            this.download = download
        }

        if (typeof upload === 'function') {
            this.upload = upload
        }
    }

    async send(url, method, body) {
        let resolve, reject
        const ps = new Promise((res, rej) => {
            resolve = res
            reject = rej
        })

        let protocol = null
        if (url.startsWith('https:')) {
            protocol = 'https'
        } else if (url.startsWith('http:')) {
            protocol = 'http'
        } else {
            throw Error('Unsupported protocol')
        }
        let request
        if (typeof require === 'function') {
            request = require(protocol).request
        } else {
            request = (await import(protocol)).request
        }

        const urlObject = new URL(url)
        this.headers['Content-Length'] =
            body instanceof Blob ? body.size : Buffer.byteLength(body)

        const options = {
            path: urlObject.pathname + urlObject.search,
            method,
            hostname: urlObject.hostname,
            port: urlObject.port,
            headers: this.headers
        }

        const req = request(options, res => {
            let responseData = ''
            let receivedBytes = 0
            const contentLength = parseInt(res.headers['content-length'], 10)

            if (res.statusCode === 204) {
                resolve()
                return
            }

            res.on('data', chunk => {
                receivedBytes += chunk.length
                if (this.download) {
                    this.download(receivedBytes, contentLength)
                }
                responseData += chunk
            })

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(responseData)
                } else {
                    reject(responseData)
                }
            })
        })

        if (body instanceof Blob) {
            body.arrayBuffer().then(buffer => {
                req.write(Buffer.from(buffer))
                req.end()
            })
        } else {
            req.write(body, () => {
                req.end()
            })
        }

        return ps
    }
}

export const getClient = useFetch => {
    let client
    if (useFetch) {
        client = new FetchClient()
    } else {
        if (typeof XMLHttpRequest !== 'undefined') {
            client = new XHRClient()
        } else {
            client = new HttpRequestClient()
        }
    }
    return client
}

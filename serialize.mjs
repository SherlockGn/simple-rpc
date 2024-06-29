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
            const e = globalThis[value.type](value.message)
            e.name = value.name
            e.stack = value.stack
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
]

let id = 0
let cache
let blobList

const toBasicObject = obj => {
    id = 0
    cache = new WeakMap()
    blobList = []
    const basicObject = _toBasicObject(obj)
    cache = null
    return basicObject
}

const _toBasicObject = obj => {
    if (cache.has(obj)) {
        return {
            refer: cache.get(obj),
            type: 'circular'
        }
    }

    const i = basic.findIndex(type => type.check(obj))
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
        }
        blobList.push(obj)
        return ret
    }

    if (Array.isArray(obj)) {
        const currentId = id++
        cache.set(obj, currentId)
        const value = {}
        for (const idx in obj) {
            value[idx] = _toBasicObject(obj[idx])
        }
        const ret = {
            id: currentId,
            type: 'array',
            value
        }

        return ret
    }

    if (obj instanceof Set) {
        const currentId = id++
        cache.set(obj, currentId)
        const value = []
        for (const item of obj) {
            value.push(_toBasicObject(item))
        }
        const ret = {
            id: currentId,
            type: 'set',
            value
        }
        return ret
    }

    if (obj instanceof Map) {
        const currentId = id++
        cache.set(obj, currentId)
        const value = []
        for (const [key, item] of obj) {
            value.push({
                key: _toBasicObject(key),
                item: _toBasicObject(item)
            })
        }
        const ret = {
            id: currentId,
            type: 'map',
            value
        }
        return ret
    }

    if (obj instanceof Object) {
        const currentId = id++
        cache.set(obj, currentId)
        const value = {}
        for (const key in obj) {
            value[key] = _toBasicObject(obj[key])
        }
        const ret = {
            id: currentId,
            type: 'object',
            value
        }
        return ret
    }
}

const _revert = obj => {
    if (obj.type === 'circular') {
        obj.tag = '__circular__neko__simple__rpc__'
        return obj
    }

    let hasId = typeof obj.id === 'number'
    const id = obj.id

    const i = basic.findIndex(type => type.type === obj.type)
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
        const value = []
        for (const k in obj.value) {
            value[+k] = _revert(obj.value[k])
        }
        if (hasId) {
            cache.set(id, value)
        }
        return value
    }

    if (obj.type === 'set') {
        const value = new Set()
        for (const item of obj.value) {
            value.add(_revert(item))
        }
        if (hasId) {
            cache.set(id, value)
        }
        return value
    }

    if (obj.type === 'map') {
        const value = new Map()
        for (const item of obj.value) {
            value.set(_revert(item.key), _revert(item.item))
        }
        if (hasId) {
            cache.set(id, value)
        }
        return value
    }

    if (obj.type === 'object') {
        const value = {}
        for (const key in obj.value) {
            value[key] = _revert(obj.value[key])
        }
        if (hasId) {
            cache.set(id, value)
        }
        return value
    }
}

const isNotLinked = obj => {
    return (
        typeof obj === 'object' &&
        typeof obj?.refer === 'number' &&
        obj.tag === '__circular__neko__simple__rpc__' &&
        obj.type === 'circular'
    )
}

const setRef = obj => {
    if (basic.some(item => item.check(obj))) {
        return obj
    }

    if (isNotLinked(obj)) {
        return cache.get(obj.refer)
    }

    if (Array.isArray(obj)) {
        for (const k in obj) {
            obj[k] = setRef(obj[k])
        }

        return obj
    }

    if (obj instanceof Set) {
        const s = new Set()
        for (const item of obj) {
            s.add(setRef(item))
        }
        obj.clear()
        for (const item of s) {
            obj.add(item)
        }

        return obj
    }

    if (obj instanceof Map) {
        const m = new Map()
        for (const [key, item] of obj) {
            m.set(setRef(key), setRef(item))
        }
        obj.clear()
        for (const [key, item] of m) {
            obj.set(key, item)
        }

        return obj
    }

    if (typeof obj === 'object') {
        for (const k in obj) {
            obj[k] = setRef(obj[k])
        }

        return obj
    }
}

const revert = obj => {
    cache = new Map()
    const r = _revert(obj)
    setRef(r)
    cache = null
    return r
}

export const serializeWithBlobs = obj => {
    return {
        json: serialize(obj),
        blobs: blobList
    }
}

export const serialize = obj => {
    return JSON.stringify(toBasicObject(obj))
}

export const deserialize = str => {
    return revert(JSON.parse(str))
}

export const replace = (obj, check, replacer) => {
    if (check(obj)) {
        return replacer(obj)
    }

    if (basic.some(item => item.check(obj))) {
        return obj
    }

    if (Array.isArray(obj)) {
        for (const k in obj) {
            obj[k] = replace(obj[k], check, replacer)
        }

        return obj
    }

    if (obj instanceof Set) {
        const s = new Set()
        for (const item of obj) {
            s.add(replace(item, check, replacer))
        }
        obj.clear()
        for (const item of s) {
            obj.add(item)
        }

        return obj
    }

    if (obj instanceof Map) {
        const m = new Map()
        for (const [key, item] of obj) {
            m.set(replace(key, check, replacer), replace(item, check, replacer))
        }
        obj.clear()
        for (const [key, item] of m) {
            obj.set(key, item)
        }

        return obj
    }

    if (typeof obj === 'object') {
        for (const k in obj) {
            obj[k] = replace(obj[k], check, replacer)
        }

        return obj
    }
}

const test = () => {
    const qux = {
        x: 1,
        y: 2,
        sym: Symbol('sym'),
        func: () => console.log('hello'),
        infs: [Infinity, -Infinity, NaN],
        z: new Date(),
        a: new RegExp('^a$', 'i'),
        b: new ReferenceError('b'),
        c: BigInt('12345678901234567890'),
        d: null,
        e: undefined,
        f: {
            a: 1,
            b: '2'
        }
    }

    qux.f.circular = qux

    let obj = {
        foo: 'bar',
        baz: [1, 2, 3],
        qux,
        f: new Set([1, 2, 3]),
        g: new Map([
            ['a', 1],
            ['b', 2]
        ])
    }

    obj.g.set(obj, obj)
    obj.f.add(obj)
    obj.baz.push(obj.g)

    console.dir(obj, { depth: null })

    const converted = toBasicObject(obj)

    const reverted = revert(converted)

    console.dir(reverted, { depth: null })
}

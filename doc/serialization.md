# Serialization

You might be curious about why the Simple RPC framework supports so many types which not supported by `JSON.stringify` or `JSON.parse`, even objects with circular properties, mentioned in [RPC](./rpc).

The reason is that a powerful serialization algorithm is used. You can experience the power of it by using the `serialize` and `deserialize` functions exported from  the package.

```javascript
import { serialize } from '@neko-gong/simple-rpc'

const qux = {
    f: {
        a: 1,
        b: '2'
    }
}
qux.f.circular = qux
let o = {
    foo: 'bar',
    baz: [1, 2, 3],
    qux,
    q: qux,
    f: new Set([1, 2, 3]),
    g: new Map([
        ['a', 1],
        ['b', 2]
    ])
}
o.g.set(o, o)
o.f.add(o)
o.baz.push(o.g)

console.log(serialize(o))
```

The serialization result is:

```javascript
{
  "id": 0,
  "type": "object",
  "value": {
    "foo": { "type": "string", "value": "bar" },
    "baz": {
      "id": 1,
      "type": "array",
      "value": {
        "0": { "type": "number", "value": 1 },
        "1": { "type": "number", "value": 2 },
        "2": { "type": "number", "value": 3 },
        "3": {
          "id": 2,
          "type": "map",
          "value": [
            {
              "key": { "type": "string", "value": "a" },
              "item": { "type": "number", "value": 1 }
            },
            {
              "key": { "type": "string", "value": "b" },
              "item": { "type": "number", "value": 2 }
            },
            {
              "key": { "refer": 0, "type": "circular" },
              "item": { "refer": 0, "type": "circular" }
            }
          ]
        }
      }
    },
    "qux": {
      "id": 3,
      "type": "object",
      "value": {
        "f": {
          "id": 4,
          "type": "object",
          "value": {
            "a": { "type": "number", "value": 1 },
            "b": { "type": "string", "value": "2" },
            "circular": { "refer": 3, "type": "circular" }
          }
        }
      }
    },
    "q": { "refer": 3, "type": "circular" },
    "f": {
      "id": 5,
      "type": "set",
      "value": [
        { "type": "number", "value": 1 },
        { "type": "number", "value": 2 },
        { "type": "number", "value": 3 },
        { "refer": 0, "type": "circular" }
      ]
    },
    "g": { "refer": 2, "type": "circular" }
  }
}

```

From the result we can find that each object contains a unique `id` and each circular reference is represented by `refer`.

The `deserialize` function can restore the original object from the serialized result by using a cache.

```javascript
const d = deserialize(serialize(o))

assert.deepStrictEqual(d, o)
assert.equal(d.qux, d.q)
assert.equal(d.baz[d.baz.length - 1], d.g)
```
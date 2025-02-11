const external = ['fs', 'http', 'https', 'path', 'stream']

export default [
    {
        input: 'index.mjs',
        output: [
            { file: 'dist/index-esm.mjs', format: 'esm' },
            { file: 'dist/index-cjs.cjs', format: 'cjs' }
        ],
        external
    },
    {
        input: 'client.mjs',
        output: [
            { file: 'dist/client-esm.mjs', format: 'esm' },
            { file: 'dist/client-cjs.cjs', format: 'cjs' },
            {
                file: 'dist/client-umd.js',
                format: 'umd',
                name: 'simpleRpcClient'
            }
        ],
        external
    }
]

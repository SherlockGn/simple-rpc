import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    outDir: '../docs',
    base: '/simple-rpc/',
    title: 'Simple RPC',
    description: 'An easy-to-use RPC framework',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Examples', link: '/markdown-examples' }
        ],

        sidebar: [
            {
                text: 'Introduction',
                items: [
                    {
                        text: 'What is Simple RPC?',
                        link: '/what-is-simple-rpc'
                    },
                    { text: 'Quick Start', link: '/quick-start' }
                ]
            },
            {
                text: 'API Reference',
                items: [
                    { text: 'createServer', link: '/create-server' },
                    { text: 'Server', link: '/server' },
                    { text: 'Client', link: '/client' },
                    { text: 'RPC', link: '/rpc'}
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/SherlockGn/simple-rpc' }
        ]
    }
})

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
                    { text: 'Create Server', link: '/create-server' },
                    { text: 'Server', link: '/server' },
                    { text: 'RPC Context', link: '/rpc-context' },
                    { text: 'Client', link: '/client' },
                    { text: 'RPC', link: '/rpc' },
                    { text: 'Files', link: '/files' }
                ]
            },
            {
                text: 'Implementation',
                items: [
                    { text: 'Serialization', link: '/serialization' },
                    {
                        text: 'Client Implementation',
                        link: '/client-implementation'
                    }
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/SherlockGn/simple-rpc' }
        ]
    }
})

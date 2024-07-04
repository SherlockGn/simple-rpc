---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Simple RPC"
  text: "An easy-to-use RPC Framework"
  actions:
    - theme: brand
      text: Quick Start
      link: /quick-start

    - theme: alt
      text: API Reference
      link: /create-server

features:
  - title: Easy to Use
    icon: 🔑
    details: You can invoke server-side functions from your client as if they were local.
  - title: Awesome serialization algorithm
    icon: 🚀
    details: Supports common types that JSON.stringify cannot handle, such as undefined, Date, RegExp, Infinity, Set, Map, and more.
  - title: File as parameters
    icon: 📄
    details: You can use files as parameters or return values, making it easier to handle file uploads and downloads.
---


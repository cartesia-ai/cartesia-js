# Next.js Example

A simple Next.js app showcasing Cartesia in a browser.

```bash
# not pnpm!
npm run dev
```

The Cartesia SDK works in browsers, including WebSockets. This example is the exception: it imports the SDK from your filesystem rather than installing it into `node_modules` like a normal package, so WebSockets won't work here. In your own project, install `@cartesia/cartesia-js` as a dependency and they will work as expected.


# Development

```sh
make
make inc
```

# MathJax 3 to MathJax 4

1. Get MathJax v4 working [synchronously](https://docs.mathjax.org/en/latest/server/preload.html#node-preload) because that's what the markdown plugin [requires](https://github.com/markdown-it/markdown-it/issues/1053). The cost of this is having to explicitly list all the dependencies, but this boilerplate just follows what's in the docs. This is in mathjax4-sync.js, which just exports some functions.
2. Upgrade the markdown plugin to call it. I vendored markdown-it-mathjax4.js (from [here](https://github.com/tani/markdown-it-mathjax3/blob/master/index.ts)). It's also possible to process the raw html (mathjax3-direct.js), but this is easier, faster, and less of a hack.
3. Fix the problems with display math by centering
4. [Choose a font](https://docs.mathjax.org/en/latest/upgrading/whats-new-4.0/fonts.html#specifying-a-font-in-node-applications), add the extensions needed
5. Add error handling, by detecting, rethrowing, and catching errors and showing them in the page
6. Things like mathit and arrays just work now
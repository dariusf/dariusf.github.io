
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

# Fixing MathJax retry errors

MathJax [basically](https://docs.mathjax.org/en/v4.0/web/retry.html) [doesn't](https://docs.mathjax.org/en/latest/upgrading/whats-new-4.0/promises.html) [work](https://groups.google.com/g/mathjax-users/c/cgAgMsS2_9E/m/LMngdjsfAgAJ) in sync mode.
Unfortunately, render rules in markdown-it [cannot](https://github.com/markdown-it/markdown-it/blob/master/docs/development.md#i-need-async-rule-how-to-do-it) [be async](https://github.com/markdown-it/markdown-it/issues/1053).
Fortunately, eleventy calls markdown-it [asynchronously](https://github.com/11ty/eleventy/blob/main/src/Engines/Markdown.js).

How to resolve this? First, some background on how markdown-it works.

markdown-it parse rules operate on a token array and mutate it.
Rules are registered on a per-token basis.
Render rules then take the token array and output a sequence of e.g. HTML fragments.

The old markdown-it-mathjax plugin called MathJax synchronously in render rules.
The [solution](https://github.com/markdown-it/markdown-it/issues/256#issuecomment-2434345725) is to change it so it starts rendering during the parse phase.
As soon as it is parsed, the LaTeX is immediately rendered using async MathJax, and a UUID is left in its place.
The markdown-it render entry point is overridden so it awaits all the render promises before invoking the render rules, which now only replace the UUIDs with HTML fragments.
This makes the plugin API more complicated but is acceptable for now.

Because fragments of math are rendered asynchronously, dependencies between them need to be sequentialised.
The only dependency at the moment is uses of newcommands, so these are now placed at the top and rendered for their side effects before the rest of the math in posts.
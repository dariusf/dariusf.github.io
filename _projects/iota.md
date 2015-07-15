---
layout: project
title: Iota
excerpt: Io-to-JavaScript compiler
date: 2014-05-01
featured: true
tags: [javascript, io, compiler, transpiler, parser]
link: http://dariusf.github.io/iota
thumbnail: io.svg
---
{% highlight js %}
fact := method(n, if (n == 0, 1, n * fact (n - 1)))
writeln(fact(5))
{% endhighlight %}

Iota is a source-to-source compiler which accepts [Io language](http://iolanguage.org/) code and outputs JavaScript. It interoperates well with JavaScript and runs both in the browser and on the server.

It was written as an experiment for [CodeCombat's parser challenge](http://codecombat.challengepost.com/) (in which it [won a prize](http://blog.codecombat.com/new-experimental-languages-python-lua-clojure-and-io)!) and is currently being used in [CodeCombat](http://codecombat.com/) to facilitate playing in Io.

It's [completely open source](https://github.com/dariusf/iota) and [available on npm](https://www.npmjs.org/package/iota-compiler). Try it out [here](http://dariusf.github.io/iota).
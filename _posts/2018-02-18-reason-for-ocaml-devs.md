---
layout: post
title: "Reason for OCaml developers"
date: 2018-02-18 08:00:00 +0800
---

Reason is an alternative front end for OCaml, much like the [revised syntax](https://caml.inria.fr/pub/docs/manual-camlp4/manual007.html).

We'll go over what's new, focusing on how Reason improves the OCaml ecosystem.

## Syntax

Reason is primarily a new look for OCaml: it renders OCaml source in a JavaScript-like syntax.

The cosmetic merits of this have been debated in other places, so we'll focus only on objective improvements. The main one is that a number of OCaml's syntactic warts have been fixed; for example, [nested matches](https://en.wikipedia.org/wiki/Dangling_else):

```ocaml
match xs with
| x :: xs ->
  match ys with
  | [] -> []
  | y :: ys -> (x, y)
| [] -> [] (* which match does this branch belong to? *)
```

The last line is ambiguous without parenthesizing further, and is parsed as belonging to the closest match. We must use `begin`/`end` or parentheses to disambiguate; the former is itself considered [a bit of a wart](https://stackoverflow.com/a/9936801), but works equally well here.

```ocaml
match xs with
| x :: xs ->
  begin match ys with
  | [] -> []
  | y :: ys -> (x, y)
  end
| [] -> []

match xs with
| x :: xs ->
  (match ys with
  | [] -> []
  | y :: ys -> (x, y))
| [] -> []
```

Reason addresses this problem by requiring blocks to be delimited, and choosing relatively terse and familiar tokens for the purpose. Note the splat syntax for destructuring a cons list.

```js
switch (xs) {
  | [x, ...xs] =>
    switch (x) {
      | [] =>
      | [y, ...ys] => (x, y)
    }
  | [] => []
}
```

`if`-expressions are given the same treatment. The following is a common construction when writing imperative code, but fails to type-check:

```ocaml
if condition then
  1
else
  print_endline "else branch";
  2
(*
  Error: This expression has type unit but an expression was expected of type int
*)
```

The semicolon binds more loosely than most would intuitively expect. This expression is parsed as:

```ocaml
(if condition then
  1
else
  print_endline "else branch");
  2
```

... which is the sort of thing one has to trip over repeatedly to learn.

Again, Reason's solution is to have opening and closing delimiters.

```js
if (condition) {
  1
} else {
  print_endline "else branch";
  2
}
```

The double semicolon has also been removed. It's arguably one of the more obvious warts, as one immediately encounters it when trying out OCaml's REPL, where it [has a subtly different meaning](https://discuss.ocaml.org/t/double-semicolon-peculiarity/1261/7) from when it appears in a source file.

The tradeoff is that every declaration is ended by a semicolon. This is a little more verbose, but it unifies the _four_ delimiters OCaml uses: `;`, `;;`, `in`, or nothing. One might argue that OCaml's `;` communicates an imperative semantics, while the other delimiters only serve a syntactic function, and thus they shouldn't be conflated. That is a legitimate argument; Reason seems to have decided in favor of overloading `;` to keep the language smaller, and closer to JS' imperative-by-default semantics.

Function arguments must be parenthesized and separated by commas. Whether the increased verbosity in the 1-2 argument cases is worth it and whether it makes sense with currying have already been [debated at length](https://discuss.ocaml.org/t/reason-general-function-syntax-discussion/537), so we'll just consider what it improves: functions can no longer be accidentally applied to too many arguments due to missing semicolons/parentheses, so the type error that results from that should no longer occur.

A few other oddities have been fixed, like type parameters appearing before constructors:

```
type list('a) =
  | Nil
  | Cons('a, list('a));
```

instead of

```
type 'a list =
  | Nil
  | Cons of 'a * 'a list
```

SML shares this reversed syntax, but other ML derivatives like Coq's vernacular language, F#, F*, and Haskell derivatives do not.

Block comments now look like C's, so parenthesizing the multiplication operator isn't as awkward:

```
/* Reason block comment */
let a = (*);

(* OCaml; spaces inside the parens are necessary *)
let a = ( * )
```

Product types are written like their term-level counterparts: `(int, float)` instead of `int * float`.

It's notable that a number of these changes also appear in the revised syntax, in spirit if not in form.

## Tooling

### Basics

The most basic way to use Reason is [`refmt`](https://github.com/reasonml/reason-cli), a parser/pretty-printer that converts both from and to OCaml syntax. It's easy to use, but is usually invoked by (and bundled with) higher-level tools.

```
$ refmt a.ml > a.re
$ refmt --print ml a.re > a1.ml
```

There's also `rtop`, which is `utop` with the new parser.

To compile to JS, Reason uses BuckleScript, an OCaml-to-JS compiler. BuckleScript provides `bsc` and `bsrefmt`, compilers with corresponding front ends, and `bsb`, a repackaged [Ninja](https://ninja-build.org/) with rules for handling OCaml/Reason sources. `bsb` is the simplest high-level way to interact with all of this and target JS, the rough equivalent of `ocamlbuild` or `dune`.

### npm and OPAM

[redex](https://redex.github.io/) is the equivalent of the [OPAM repository](https://opam.ocaml.org/packages/). It is backed by npm, so if you're targeting only JS and using only npm packages, it should be sufficient to `npm install` them, then add them to BuckleScript's configuration file, `bsconfig.json`. There are a couple of [extra steps](https://stackoverflow.com/a/46012995), but that's the basic workflow.

[esy](http://esy.sh/) is sort of like the Reason [version](http://esy.sh/docs/en/what-why.html) of `opam` for targeting JS: it installs and manages OCaml compilers, eases the use of OPAM packages (which need to be compiled with BuckleScript), and is [agnostic to build system](https://github.com/esy-ocaml/esy-reason-project/blob/master/package.json). `esy [command]` is the rough equivalent of the familiar ``eval `opam config env`; [command]``.

### Going cross-platform

[bsb-native](https://github.com/bsansouci/bsb-native) is a fork of `bsb` that supports native compilation. It's intended for [cross-platform development](https://jaredforsyth.com/posts/making-a-cross-platform-mobile-game-in-reason-ocaml/): compiling to both JS and native targets from the same codebase.

[reprocessing](https://github.com/Schmavery/reprocessing/), a Reason port of [Processing](https://processing.org/), is the de facto cross-platform 'framework'. It has fancy development features like the use of Dynlink for hot reloading. [rsb](https://github.com/jaredly/reprocessing-scripts) [automates the cross-platform aspects](https://jaredforsyth.com/posts/reason-mobile-cross-compilation-deep-dive/) and [takes hot reloading further](https://jaredforsyth.com/posts/hot-reloading-ocaml-on-web-desktop-and-android/).

There is a lot of additional complexity to be ironed out here (notably, around managing dependencies), but the cross-platform work adds significantly to the OCaml ecosystem and takes it in a promising new direction.

### Development

Most of the other OCaml tools have Reason equivalents. An alternate version of Merlin, `ocamlmerlin-reason`, comes with the Reason CLI package. There is a [debugger](https://github.com/reasonml/red) with a nicer CLI interface available. `dune` works with Reason files out of the box.

[BuckleScript works with ppx processors](https://blog.hackages.io/reasonml-ppx-8ecd663d5640), so things like `ppx_deriving` could conceptually be used with esy.

Also notable is a project to [prettify OCaml's error messages](https://github.com/esy-ocaml/BetterErrors), which is intended for use in esy, but is also useful when writing OCaml.

## Ecosystem

reprocessing [enables](https://github.com/bsansouci/reprocessing-example) a whole new domain of applications that OCaml may be used in. It is built on [reasongl](https://github.com/bsansouci/reasongl), which abstracts over WebGL and OpenGL with a common interface.

[repromise](https://github.com/aantron/repromise) is a similar abstraction which unifies lwt and JS' native promises.

GADTs can be used effectively to [model GraphQL types](https://andreas.github.io/2017/11/29/type-safe-graphql-with-ocaml-part-1/), and there are a number of [Reason](https://github.com/mhallin/graphql_ppx) [implementations](https://redex.github.io/package/regql) of GraphQL in development. OCaml's strongly-typed nature works particularly well for this sort of thing.

Of course, one has to mention React here; Reason's bindings have [official support](https://www.reactiflux.com/transcripts/jordan-walke/) and [streamline the use of things like Redux and routers](https://twitter.com/jordwalke/status/962869115080724480).

## Conclusion

The main criticism against Reason that I've seen is that it fragments the OCaml ecosystem: documentation is written in two languages instead of one, people reinvent OCaml libraries in Reason, and tooling ultimately becomes incompatible. I really don't think anyone wants to see this happen: as long as Reason remains a front end for the OCaml toolchain, the Reason ecosystem only adds to OCaml's.

In other words, if you're a seasoned OCaml developer, you can continue to write OCaml and still benefit from the things others are building; the best example is reprocessing and the [cross-platform apps](https://github.com/jaredly/gravitron) built with it, where you can just as easily use OCaml. OCaml was able to cross-compile before, but things were never so accessible for people who just want to build apps in a nice language without having to wrestle with tools.

I think Reason is a great step forward for making OCaml's ecosystem available to more people, and pushing it into new areas, like games and web development.

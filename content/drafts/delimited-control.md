---
# title: "Dipping your toes into delimited control"
title: "A primer on delimited control"
date: 2025-10-27
math: true
---

The literature on continuations and delimited control is vast.
This blog post is intended as an opinionated starting point, to introduce the key ideas and issues at a high level and provide pointers to the relevant papers.

# Programming with shift and reset

A good starting point is to get some intuition writing programs which use shift and reset, in a sense the most well-behaved of the family of operators.
[Kenichi Asai's tutorial](https://www.is.ocha.ac.jp/~asai/cw2011tutorial/main-e.pdf) has many examples.

The easiest language to try them in today is Racket, which has the most complete [library](https://docs.racket-lang.org/reference/cont.html) of operators.

```racket
(example)
```

A close second is OCaml, using [delimcc_of_fxhandler](https://github.com/kayceesrk/delimcc_of_fxhandler).
Two caveats are that 1. a library is needed for multishot continuations, and 2. the type system does not help.
An alternative is [this port](https://gist.github.com/dariusf/fd9a93de6b9e20dd1cf2f64b146b8e53) of Oleg Kiselyov's *Genuine Shift/Reset*, which provides a typed monadic API.

```ocaml
(example)
```

<!-- javascript https://github.com/nythrox/effects.js/ -->

## Use cases

- Nondeterminism
- [Probabilistic programming](https://homes.luddy.indiana.edu/ccshan/rational/dsl-paper.pdf)
- [Automatic differentiation](https://dl.acm.org/doi/10.1145/3341700)

There is significant overlap in [use cases](https://github.com/ocaml-multicore/effects-examples/) with effect handlers.

# Semantics of shift and reset

Defunctiinalise into an abstract machine. Use examples from the biernacki

Transition system. Something which a machine being something which can be implemented simply I. Hardware. Keeping track of trees seems daunting.

https://harrisongoldste.in/papers/drafts/wpe-ii.pdf

The interpreter for control from 4 operators
https://arxiv.org/pdf/2305.02852

# Answer-type modification

# Other operators in the family

## Distinguishing shift and control

## Distinguishing shift and shift0

## Distinguishing control and control0

## In what sense is shift static, and control dynamic?

importantly, not the same as lexical scope and dynamic scope.

## Relation to algebraic effects

shift0 corresponds to deep handlers, and control0 corresponds to shallow.

- [On the expressive power of user-defined effects: effect handlers, monadic reflection, delimited control](https://dl.acm.org/doi/10.1145/3110257)
- [Typed Equivalence of Effect Handlers and Delimited Control](https://maciejpirog.github.io/papers/typed-equivalence-fscd2019.pdf)

<!-- # An incomplete history

Prompts in the REPL -->

<!--

** continuations

---
title: "Getting started with delimited continuations"
date: 2025-04-23
---

- [shift/reset](#shiftreset)
- [Semantics](#semantics)
- [Answer-type modification](#answer-type-modification)
- [Other operators](#other-operators)
- [Defunctionalization](#defunctionalization)
- [Refunctionalization](#refunctionalization)
- [Algebraic effects](#algebraic-effects)
- [monadic reflection](#monadic-reflection)

<!-- temporary hack for vs code simple browser -->
<!-- <style>
html {
  filter: invert(1);
}
</style> -->

<!-- Continuations have a long and storied history, so it can be hard to figure out where to start with them.
The key concepts are scattered across many classic papers.

This is the overview I wished existed when I first started learning about them. It introduces the big ideas intuitively, using examples, and gives pointers to the important papers.

The main prerequisite is that you have heard of CPS and roughly know what it is. There are many excellent introductions to it.

- [A Gentle Run-through of Continuation Passing Style and Its Use Cases ](https://free.cofree.io/2020/01/02/cps/)
- [By example: Continuation-passing style in JavaScript](https://matt.might.net/articles/by-example-continuation-passing-style/)
- [Continuations by example: Exceptions, time-traveling search, generators, threads, and coroutines](https://matt.might.net/articles/programming-with-continuations--exceptions-backtracking-search-threads-generators-coroutines/) -->

<!-- This post is an introduction to the world of delimited continuations, with a focus on conveying intuition. -->
<!-- There will be pointers to the key papers for further reading. -->

<!-- ### What?

Continuations represent *the rest of the computation*[^1].

```js
(3 * 5) + 1
```

In a <abbr title="call-by-value">typical</abbr> language, the
subexpression
`(3 * 5)`
evaluates first.
The surrounding *context*, `• + 1`, is the continuation.

`•` is (rather unimaginatively) called a *hole* and indicates where the result of `(3 * 5)` gets plugged into to continue the computation.

Here, we have just a simple expression, but the continuation may be the rest of the entire program, which may be very large.

When referring to "continuations" as a programming language feature, we usually mean the ability to manipulate them as first-class values.
This means the context `• + 1` is <abbr title="reified">made available</abbr> in the program as the lambda expression `(v => v + 1)`, a value. -->

<!-- ### Why?

Why are continuations interesting to have in a programming language?
They allow one to implement, *as libraries*, a wide variety of control flow features, including: break/continue, exceptions, coroutines, nondeterminism, async-await, and arbitrary monadic effects.

Moreover, they allow users to write programs using these features in *direct style*, without monads.

You may have heard this mentioned as an advantage of *algebraic effects* in OCaml 5.
Indeed, there is a [close correspondence](#algebraic-effects) between algebraic effects and continuations. -->

<!-- ## CPS

The most primitive way to work with continuations is to write programs in *continuation-passing style* (CPS).

A function in CPS have an extra parameter, the continuation, usually named `k`. Rather than return, they invoke the continuation on the value that would have been returned, in tail position.

```ocaml
let f x k =
  k (x + 1)
```

Note that here, the call to the `(+)` function is in direct style - it returns normally, not by invoking a continuation passed as an argument.
When programming in CPS, we might allow ourselves to mix CPS and direct style, but strictly speaking, if the entire program is in CPS, `(+)` should return via a continuation as well.

```ocaml
let f x k =
  plus x 1 (fun v -> k v)
```

This can be done more systematically using the *CPS transform*, a global program transformation.

CPS is useful in its own right as an [intermediate representation](https://en.wikipedia.org/wiki/Continuation-passing_style) for compilers, as well as a semantics for the operators which will be shown next.
-->

<!-- ## shift/reset

We'll start by getting a feel for the *shift* and *reset* operators, which are the most well-behaved of the bunch.
Once we have some fluency with their use (and quirks), we'll talk about their semantics, and only then move on to the other operators.

```
```

*continuation-composing style*.

- why and motivation. shift reset is most fundamental. there are implementations in many langs. autodiff

Asai's [Introduction to Programming with Shift and Reset](http://pllab.is.ocha.ac.jp/~asai/cw2011tutorial/main-e.pdf) shows many interesting programs which can be written with them.

We'll focus on the *shift* and *reset* operators, which in my opinion have the most intuitive semantics.

with other operators presented as variations of the core ideas here.

- intuition. must find the delimiter. a slice of the stack with a recursive function. shift as a conversion to cps
- patterns. asai
- answer type modification and solutions via types. ochacaml. we propose in our paper, hoare
- semantics. reducton rules in racket
- prompt control, zero or not. 4 places. side by side. don't gain anything from shan04
- relation to effects. equivalence
- reasoning. httcc? heifer


## Semantics

reduction
cps
definition interpreter
our semantics


Abstracting Control - Danvy & Filinski 90

- shift reset first proposed, as compose and identity for continuation functions


## Answer-type modification



## Other operators

call/cc
shift0
Prompt/control -->

<!-- ```
    (reset val) => val
    (reset E[(shift k expr)]) => (reset ((lambda (k) expr)
                                         (lambda (v) (reset E[v]))))
      ; where E has no reset

(prompt val) => val
(prompt E[(control k expr)]) => (prompt ((lambda (k) expr)
                                         (lambda (v) E[v])))
  ; where E has no prompt

    (prompt0 val) => val
    (prompt0 E[(control0 k expr)]) => ((lambda (k) expr)
                                       (lambda (v) E[v]))
    (reset0 val) => val
    (reset0 E[(shift0 k expr)]) => ((lambda (k) expr)
                                    (lambda (v) (reset0 E[v])))



    (prompt E[(control0 k expr)]) => (prompt ((lambda (k) expr)
                                              (lambda (v) E[v])))
    (reset E[(shift0 k expr)]) => (reset ((lambda (k) expr)
                                          (lambda (v) (reset0 E[v]))))
    (prompt0 E[(control k expr)]) => (prompt0 ((lambda (k) expr)
                                               (lambda (v) E[v])))
    (reset0 E[(shift k expr)]) => (reset0 ((lambda (k) expr)
                                           (lambda (v) (reset E[v]))))

```

(reset0 val) => val
(reset0 E[(shift0 k expr)]) => ((lambda (k) expr)
                                (lambda (v) (reset0 E[v])))


if we don't have a reset around E, we get something like a shallow effect handler

for example, in `<shift0 k B ^ shift0 ...>`, k will be bound in B as `λx. <x ^ shift0 ...>` (with reset) vs `λx. x ^ shift0 ...` (without)

if we have further shift0s in B, they will be allowed to "escape", to access enclosing continuations. but any shift0s in k should not escape - looking at the first program, both the shift0s there should be delimited by the same reset


<shift0 k B ^ shift0 ...>
E = [.] ^ shift0 ...
k = λx. <x ^ shift0 ...>
expr = B


does reset/shift0 behave the same as reset/shift?

i'm not sure if reset/shift0 has a defined semantics, it may just be undefined behavior


That is, both the prompt/reset and control/shift sites must agree for 0-like behavior, otherwise the non-0 behavior applies.


if we don't have reset around E, we will continue with `B` instead, which will have an unhandled shift0 when invoking k

if we have a reset around E, we continue with `<B>` -->


<!-- ---

simple, accessible, intuitive explanation of what they are and what the benefits are

understanding them as cpsing functions

Functions are delimited

I would like to get hold of the cont
Now imagine any delim

What I don't get is the shift body. Surely I have to use the cont? But if I don't, the function just returns. Extra logical already, no correspondence

---

let main k = f (λx. x)
metacontinuation

---

Systematically translating shift-reset to CPS

For simple cases where we translate a single function in CPS, it's fairly direct.

1. Remove k argument and move function body under shift
2. Move call site of function under reset, with continuation passed as argument

Examples

let f = shift (fun k -> ... k 1)
in reset (1 + f)
<->
let f k = ... k 1
in f (fun x -> 1 + x)


let f = shift (fun k -> k)
in (reset (1 + f)) 1
<->
let f k = k
in (f (fun x -> 1 + x)) 1


Not all cases are simple.

- shifts may appear in pieces of code which do not correspond nicely to function boundaries
- Not all branches of a computation may use a continuation

An example of both is append. -->

<!-- ## Defunctionalization

## Refunctionalization

## Algebraic effects

## monadic reflection

bridge between delimited continuations and monads
reflect/shift lets you treat monadic value as normal value in direct style

reify/reset lets you turn a direct style computation into a monadic one
dual to shift and reset but instead of capturing continuations, they capture monadic effects

https://github.com/ocaml-multicore/effects-examples/blob/master/reify_reflect.ml


[^1]: [Introduction to Programming with Shift and Reset](http://pllab.is.ocha.ac.jp/~asai/cw2011tutorial/main-e.pdf) -->



<!-- ** ./lit-reviews/delimited-control.md
---
title: "delimited-control"
date: 2022-12-27 13:27:09 +0800
---

all about continuations

# call/cc

unknown origin
http://www.madore.org/~david/computers/callcc.html#sec_whoinv

run by pasting into dr racket and pressing cmd+r

```
brew install --cask racket
```

```
#lang racket

(let ((a 0))
  (call/cc
   (lambda (k)
     (+ (* 2 3) (/ 10 (if (zero? a) (k +inf.0) a))))))

(display
  (call/cc (lambda (cc)
            (display "I got here.\n")
            (cc "This string was passed to the continuation.\n")
            (cc "Here is another one.\n")
            (display "But not here.\n"))))
(display "---\n")

(let ((k (call/cc (lambda (cc) cc))))
  (if (string? k)
      (begin (display "str\n") (display k))
      (begin (display "cont\n") (k "lol"))
      )
  )
(display "hi again\n")
```

call/cc binds the entirety of the rest of the program, hence why it is not compositional. it's like a goto.

programming with call/cc is very tricky. very primitive.
to even write programs with it you need the helper procedure matt might defines.

need macros. need things like dynamic wind. idk if simple things like exceptions can be implemented without them.

backtracking requires you to manually keep track of the stack of places to go back to.

https://matt.might.net/articles/programming-with-continuations--exceptions-backtracking-search-threads-generators-coroutines/

the operational semantics of callcc.

slide 9 of https://www.pauldownen.com/presentations/compositional-continuations-slides.pdf

v is a value. eval ctxs are values (continuations k). m, n are functions, things which can be applied. eval ctxs specify that in fn apps, the fn is reduced first, then the arg.

callcc applies its arg (some kind of function) to [E], which is *the context in which callcc appears*.
applying the continuation replaces the current evaluation context with it

notably, it's a goto. it abandons the current context

# delimited continuations

```
#lang racket

(require racket/control)
(* 2 (reset (+ 10 (shift k (k (k 2))))))
(* 2 (reset (+ 10 (shift k (k 12)))))
(* 2 22)

(string-append "Alice" (reset (string-append " has " (shift k (string-append (k "a dog") " and the dog" (k "a bone"))))))
```

introduced in danvy90
Danvy and Filinski’s

## shift/reset

reset delimits a region, like a handler
shift is perform
there is now a stack

slides
https://shonan.nii.ac.jp/archives/seminar/103/wp-content/uploads/sites/122/2016/09/effdel.pdf

tutorial
http://pllab.is.ocha.ac.jp/~asai/cw2011tutorial/main-e.pdf

slide 21 of https://www.pauldownen.com/presentations/compositional-continuations-slides.pdf
https://docs.racket-lang.org/reference/cont.html#%28form._%28%28lib._racket%2Fcontrol..rkt%29._reset%29%29

see op semantics.
when whatever is inside reset has a redex involving shift, the value given to shift (a lambda) is applied to another lambda (which is bound to k). when k is called with some value x, the result is the captured context E with x substituted inside, *inside another reset*. all of this remains inside (the outer) reset.

once whatever is inside reset is a value, reset is gone

## shift0/reset0

materzok 2011

```
#lang racket

(require racket/control)

(reset0
 (string-append
  "Alice"
  (reset0 (string-append " has " (shift0 k1 (shift0 k2 (string-append "A cat" (k1 (k2 ".")))))))))
```

slide 23 of https://www.pauldownen.com/presentations/compositional-continuations-slides.pdf

slide 7 of https://shonan.nii.ac.jp/archives/seminar/103/wp-content/uploads/sites/122/2016/09/effdel.pdf

when nesting reset0, each successive shift0 gives us the ability to refer to enclosing delimited contexts which are further and further away. shift0 refers to the closest

slide 12 compares them
the difference with shift0 is that the outer reset is removed

# effect handlers

plotkin 2001

the difference with delimited continuations:

handlers get access to the continuation. in contrast, reset delimits, but shift binds the continuation, and inside there is what the perform body would do

these structure delimited continuations. why?

untyped delimited continuations can macro express effect handlers
simply typed delimited continuations cannot macro express effect handlers!
see forster 2017
there's a comparison with the same examples at the end of https://shonan.nii.ac.jp/archives/seminar/103/wp-content/uploads/sites/122/2016/09/effdel.pdf

-->

<!-- ** continuations blog posts

The two continuation model of streams
Simple non deterministic programming with cps

continuations blog post

Pointers and introductory reading to get started with continuations
Broad overview of topics

- different operators and the differences
- How to think about shift and reset
- Meta contexts shift 0
- The cps transform
- The cps hierarchy
- De and re func
- Uses. Backtracking
- The two continuation model
- Inversion of control
- algebraic effects
- Answer type modification
  - The answer type is r and can be different
- Monadic encoding and ways to have it in your favourite language
- the continuation monad

Questions

- does a meta continuation only arise when some part of a computation is in cps but some part is not?
- How is shift and reset translated to cps? What's the delimited version of a cps program?
- How is prompt control translated? What's the representation of the outermost reset?
- what is shift 1, shift 2? Does it correspond to the cps hierarchy?
- Why does the cps hierarchy arise? Does it have to do with cps transforming meta continuations? Isn't the cps transform one shot, in that it recurses all the way down an expression? Why does it need to be iterated? Is it because there can always be a program calling a cps program and that has to be transformed too?
- Is meta context and meta continuation the same?
- what a syntactic theory? -->

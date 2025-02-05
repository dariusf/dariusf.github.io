---
# title: "Staged logic"
title: "Verifying effectful higher-order programs with staged logic"
date: 2024-08-16
math: true
---

<!-- (23 Aug 2024) -->
<!-- (13 Sep 2024) -->

*Text version of a talk given at the [NUS PLSE Seminar](https://nus-plse.github.io/seminars.html) and [FM 2024](https://www.fm24.polimi.it/?page_id=612) in Milan.*

- [Effectful higher-order functions](#effectful-higher-order-functions)
- [Specifying higher-order functions today](#specifying-higher-order-functions-today)

# Effectful higher-order functions

Most programming languages in use today are higher-order, and allow programmers to perform *effects* (primitive state, exceptions, or algebraic effects) in any context.

This enables expressive programming patterns, e.g. using state in a closure to avoid traversing a list twice:

```ocaml
(* sum a list, and also count the number of elements *)
let count = ref 0 in
foldr (fun c t -> incr count; c+t) xs 0
```

or using a continuation to return multiple solutions when backtracking, and allowing the continuation to throw an exception to end the search efficiently:

```ocaml
let stop = raise Stop
let rec search xs k =
  try
    if found then k answer;
    (* ... keep searching *)
  with Stop -> ()
in
let result = search xs (fun answer -> if good answer then stop ())
```

Using a [modern I/O library](https://github.com/ocaml-multicore/picos#why) also makes algebraic effects pervasive.

Reasoning about effectful higher-order functions does not seem particularly difficult - we certainly do it informally every time we use them in programs!
However, support for such functions in automated verifiers varies greatly:

- *Most automated verifiers require function arguments to be pure*. Examples include Dafny, Why3, and Cameleer. This is because they lift these functions into the underlying logic (usually the first-order logic of SMT) and are restricted by what can be expressed in it.
- *Other automated verifiers rely on type system guarantees*. Examples include Prusti and Creusot, which target Rust and can exploit the fact that closures can maintain invariants over their captured state via ownership. This makes the problem simpler, with the tradeoff that this approach does not work in languages with weaker type systems.
- *Most verifiers which do support such functions are interactive*. Examples include Iris, CFML, and Steel/Pulse (F*), which are built on proof assistants. In practice, this means that they support varying levels of automation, with the tradeoff being that they are more expressive.

A second issue is that even when higher-order functions are supported, they tend to be specified *imprecisely*. We'll see an example of this shortly.

The question we're concerned with in this work is: is there a *precise* and *general* way to support effectful higher-order functions in *automated* program verifiers?

# Specifying higher-order functions today

$x + 1$
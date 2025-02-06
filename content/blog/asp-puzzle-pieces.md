---
title: "Bags of puzzle pieces in ASP"
date: 2017-11-25
math: true
---

Answer set programming is an offshoot of traditional logic programming with a number of nice properties: programs always terminate, are fully declarative (i.e. clause ordering doesn't matter and search is complete, unlike Prolog), and have a [well-defined semantics](https://en.wikipedia.org/wiki/Stable_model_semantics). Modelling a domain with relations is a wonderfully high-level way to reason about things, allowing complex rules to be represented [concisely](https://en.wikipedia.org/wiki/Answer_set_programming#Examples_of_ASP_programs).

ASP is typically applied to hard search problems, but can model pretty much anything. One area it's popular in is game design, particularly for [procedural content generation](https://adamsmith.as/papers/tciaig-asp4pcg.pdf): if we can write down the rules of, say, a puzzle game, we can straightforwardly sample valid puzzles (or even [solutions to puzzles](https://adamsmith.as/papers/fdg2013_shortcuts.pdf)) with desirable properties.

Here, we'll explore one way of sampling puzzle pieces: given an infinite bag of heterogeneous pieces, we want to grab a _handful_, put them on the game board, then rule out the worlds where the pieces don't form a valid puzzle.

Incidentally, this is how one typically approaches problems with ASP: defining the _entire_ problem space and how to prune it down to the interesting bits.

By a _handful_, we intuitively mean _some_ quantity of pieces with _some_ types. For example, we might generate [Pipe Mania](https://en.wikipedia.org/wiki/Pipe_Mania) or [Rush Hour](https://en.wikipedia.org/wiki/Rush_Hour_(puzzle)) boards such that we get a puzzle of appropriate size or difficulty.

Generally, the number of piece types is finite and much smaller than the size of the game board, so we'll want to allow duplicate pieces. We'll represent pieces very abstractly, indexed by an identifier and piece type.

```erlang
piece(1,a).
```

We'll start with 4 piece types, and an upper limit on the maximum number of pieces we want per puzzle -- ASP programs must terminate, so domains must be finite.

```erlang
#const max_n=4.

piece_type(a;b;c;d).
piece_n(1..max_n).
```

Two pieces of type `b` and one piece of type `a` might be represented as follows.

```erlang
piece(1,a).
piece(2,b).
piece(3,b).
```

Now to get our handful of pieces. There are two quantities to vary: the number of pieces and the piece types. We express this using a couple of choice rules, where one depends on the other.

```erlang
% guess a subset of pieces used
{ used(I) : piece_n(I) }.

% guess a single type for each used piece
{ piece(I,T) : piece_type(T) } = 1 :- used(I).

#show piece/2.
```

Let's try running this with [clingo](https://potassco.org/clingo/run/). We'll generate all answer sets, which is possible because we're still only working with tiny puzzles.

```
$ clingo puzzle.lp 0 -q
clingo version 5.2.1
Reading from puzzle.lp
Solving...
SATISFIABLE

Models       : 625
Calls        : 1
Time         : 0.002s (Solving: 0.00s 1st Model: 0.00s Unsat: 0.00s)
CPU Time     : 0.002s
```

We're getting there, but 625 models is probably too many for only 4 pieces. Looking at the generated answer sets, we see that there are many duplicates. For one, the earlier example appears again, this time represented as:

```erlang
piece(1,a).
piece(3,b).
piece(4,b).
```

Yet another occurrence:

```erlang
piece(1,b).
piece(2,a).
piece(3,b).
```

We don't really gain anything from having the same handful of pieces represented multiple times, as that skews the distribution of puzzles in difficult-to-predict ways once we start sampling them randomly.

In both examples above, we can see that the two arguments of `piece` are out of order and not contiguously increasing. That's somewhere we can start: giving pieces a canonical ordering, so it's easier to filter duplicates.

We first define an auxiliary predicate to capture the maximum index used. This is also the number of pieces actually generated.

```erlang
max(I) :- { used(_) } = I.
```

We then say what it means for the piece indexes to be contiguously increasing with an inductive rule. `1` is always part of an increasing sequence, and so is `N+1` if `N` is _and_ we haven't exceeded the maximum index.

```erlang
increasing(1).
increasing(N+1) :- increasing(N), N < I, max(I).
```

Finally, we rule out cases where a piece index is selected, but isn't in an increasing sequence.

```erlang
:- used(I), not increasing(I).
```

This brings us down to 341 models. Next, we ensure that pieces are sorted by index and type, by ruling out cases where they appear out of order.

```erlang
:- piece(I1,V1), piece(I2,V2), I1 < I2, V1 > V2.
```

We get 70 models now. A manual look at the answers seems promising, showing no obvious duplicates, but how do we know we're done, i.e. all answer sets are unique?

It turns out that what we're doing -- grabbing a handful of heterogeneous pieces from an infinite bag -- is an instance of [combinations with repetition](https://en.wikipedia.org/wiki/Combination#Number_of_combinations_with_repetition). The number of ways of taking `k` pieces from a bag of `n` unique pieces is given by

$$\binom{n+k-1}{k}$$

For the case of 4 pieces, we're sampling one piece, then two, etc. We add one for the case where we pick _no_ pieces.

$$\binom{7}{4}+\binom{6}{3}+\binom{5}{2}+\binom{4}{1}+1=70$$

Success!

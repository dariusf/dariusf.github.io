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
  - [Example 1: mutating the list](#example-1-mutating-the-list)
  - [Example 2: stronger precondition](#example-2-stronger-precondition)
  - [Example 3: effects outside metalogic](#example-3-effects-outside-metalogic)
- [Staged logic](#staged-logic)
  - [Effectful placeholders](#effectful-placeholders)
  - [Recursion](#recursion)
  - [Re-summarization](#re-summarization)
  - [Compaction via biabduction](#compaction-via-biabduction)
- [Solutions to problematic examples](#solutions-to-problematic-examples)
  - [Example 1](#example-1)
  - [Example 2](#example-2)
  - [Example 3](#example-3)
- [Conclusion](#conclusion)

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

Using a [modern I/O library](https://github.com/ocaml-multicore/picos#motivation) also makes algebraic effects pervasive.

Reasoning about effectful higher-order functions does not seem particularly difficult - we certainly do it informally every time we use them in programs!
However, support for such functions in automated verifiers varies greatly:

- *Most automated verifiers require function arguments to be pure*. Examples include Dafny, Why3, and Cameleer. This is because they lift these functions into the underlying logic (usually the first-order logic of SMT) and are restricted by what can be expressed in it.
- *Other automated verifiers rely on type system guarantees*. Examples include Prusti and Creusot, which target Rust and can exploit the fact that closures can maintain invariants over their captured state via ownership. This makes the problem simpler, with the tradeoff that this approach does not work in languages with weaker type systems.
- *Most verifiers which do support such functions are interactive*. Examples include Iris, CFML, and Steel/Pulse (F*), which are built on proof assistants. In practice, this means that they support varying levels of automation, with the tradeoff being that they are more expressive.

A second issue is that even when higher-order functions are supported, they tend to be specified *imprecisely*. We'll see an example of this shortly.

The question we're concerned with in this work is: is there a *precise* and *general* way to support effectful higher-order functions in *automated* program verifiers?

# Specifying higher-order functions today

<div style="display:none">
$\newcommand{\m}[1]{\mathit{&#35;1}}$
$\newcommand{\foldr}{\m{foldr}}$
$\newcommand{\xs}{\m{xs}}$
$\newcommand{\ys}{\m{ys}}$
$\newcommand{\res}{\m{res}}$
$\newcommand{\inv}{\m{Inv}}$
$\newcommand{\islist}{\m{isList}}$
$\newcommand{\list}{\m{List}}$
$\newcommand{\emp}{\m{emp}}$
$\newcommand{\req}[1]{\mathbf{req}\ &#35;1}$
$\newcommand{\ens}[1]{\mathbf{ens}\ &#35;1}$
$\newcommand{\s}[1]{\{ &#35;1 \}}$
$\newcommand{\sb}[1]{\textbf{\{}&#35;1\textbf{\}}}$
</div>

We'll use the classic $\foldr$ function as a running example.

```ocaml
let foldr f a l =
  match l with
  | [] => a
  | h :: t =>
    f h (foldr f a t)
```

$f$ is *effectful* - it may have state, exceptions, or algebraic effects.
$\foldr$ is hence an *effectful higher-order function*.

We would like to specify $\foldr$ in a way that allows a wide range of clients to be verified, including the one we saw earlier, which calls $\foldr$ with a closure.

```ocaml
let count = ref 0 in
foldr (fun c t -> incr count; c + t) 0 xs
```

Here is a specification one might write today in a modern program logic[^1].

$$
\begin{array}{c}
\forall \class{ppred}{P}, \class{foldrinv}{\inv}, f, \xs, l. \left\\{ \begin{array}{l}
    \class{triple}{(\forall x, a', \ys.\ \s{\class{ppred}{P\ x} * \class{preserve}{\inv\ \ys\ a'}}\ f(x, a')\ \s{r.\ \class{preserve}{\inv\ (x::\ys)\ r}})} \\\\
    *\ \class{shape}{\islist\ l\ \xs} * \class{ppred}{\m{all}\ P\ \xs} * \class{foldrinv}{\inv\ []\ a}
 \end{array} \right\\} \\\\
 \foldr\ f\ a\ l \\\\
 \{r.\ \class{shape}{\islist\ l\ \xs} * \class{foldrinv}{\inv\ \xs\ r} \}
\end{array}
$$

1. <div class="trigger" data-id="inv">The most salient feature of this specification is that it is parameterized over an *invariant* $\inv$, a (separation logic) *property* whose purpose is to describe the result of $\foldr$. It does this by relating the suffix of the list traversed so far - initially empty, and finally $\xs$ - with the result of the fold.</div>
2. <div class="trigger" data-id="finv">Next, we use a nested triple to require that $f$ must preserve the invariant - assuming that the invariant holds of the portion of the list that has been folded $\ys$ and the result of the recursive call $a'$, $f$ must reestablish it for $x::\ys$ and its result $r$. This is fair, as $\foldr$ contains a call to $f$, and so we need the knowledge that $f$ preserves the invariant to ensure that $\foldr$ does. As the invariant is a separation logic property, it may also be seen as a way to describe the effect of $f$.</div>
3. <div class="trigger" data-id="ppred">Anticipating that some clients may want to operate only on certain kinds of lists, the specification is further parameterized over a unary predicate $P$. A precondition $\m{all}\ P\ \xs$, which must be proved at each call site, allows $f$ to then rely on $P\ x$ in its precondition.</div>
4. <div class="trigger" data-id="shape">A shape predicate $\islist$ relating the structure $l$ to its content $\xs$ appears in both pre- and postcondition. This is to say that $\foldr$ should not change the list.</div>

<style>
  .highlight {
    color: orange;
  }
</style>
<script>
const foldrHighlightData = {
  'inv': 'foldrinv',
  'shape': 'shape',
  'ppred': 'ppred',
  'finv': 'preserve',
};
document.addEventListener('mouseover', function(event) {
  let elt=event.target.closest('.trigger');
  if (elt !== null) {
    document.querySelectorAll('.' + foldrHighlightData[elt.dataset.id])
      .forEach(a => a.classList.add('highlight'));
  }
});
document.addEventListener('mouseout', function(event) {
  let elt=event.target.closest('.trigger');
  if (elt !== null) {
    document.querySelectorAll('.' + foldrHighlightData[elt.dataset.id])
      .forEach(a => a.classList.remove('highlight'));
  }
});
</script>

This specification elegantly solves the problem for the client we presented earlier (using an invariant to relate the value of $\m{count}$ and $t$, and an identity $P$).
We argue, however, that it is *imprecise*: there are many clients that *cannot be verified* using it *without significant changes*.

The authors of the specification say as much[^1]:
<!-- [Iris tutorial](https://iris-project.org/tutorial-pdfs/iris-lecture-notes.pdf) says as much (pg 35): -->

> Different clients may instantiate foldr with some very different functions, hence it can be hard to give a specification for f that is reasonable and general enough to support all these choices.

The problem is that due to the use of abstract properties, this specification commits somewhat prematurely to an *abstraction* of $f$'s behavior, and this abstraction may not be precise enough to verify a given client.

We'll look at three examples of such clients.

## Example 1: mutating the list

Suppose we allowed $f$ to mutate the list.

```ocaml
let foldr_ex1 l = foldr (fun x r -> let v = !x in
                                    x := v+1; v+r) l 0
```

This is not technically allowed by the shape predicate in the postcondition, but suppose we changed it to $\islist\ l\ \xs'$.

The problem is that $\inv\ \xs\ r$ tells us nothing about $\xs'$.
The use of invariants required us to *commit to a parameterization*, and this particular one is insufficient.

To fix this, we would have to add $\xs'$ as a parameter to every occurrence of $\inv$.
While adding results in a more general specification, it would also be cluttered with more anticipated client use cases.

## Example 2: stronger precondition

Suppose we would like to pass a function argument which relies on a property concerning intermediate results of the fold.

```ocaml
let foldr_ex2 l = foldr (fun x r -> assert(x+r>=0); x+r) l 0
```

The problem here is that we can't use $P$ to strengthen the precondition of $f$, as we need a property relating $x$ and $r$, and $P$ only constrains $x$. $\inv$ also cannot be used, as it only tells us about $r$, not $x$.

While it is possible to assume something stronger here, e.g. $x \geq 0 \wedge r \geq 0$, in general it would be awkward to decompose the property into two parts.

## Example 3: effects outside metalogic

This example illustrates a different problem with invariants: suppose we allowed the function to throw an exception.

```ocaml
let foldr_ex3 l = foldr (fun x r -> if x>=0 then x+r
                                    else raise Exc()) l 0
```
The problem is that our specification requires $f$ to *return* to preserve the invariant, and does not say anything about exceptions.

The more general issue is that we are trying to abstract $f$'s behavior into a predicate of the underlying logic, and that limits expressiveness to that of the underlying logic.

This is the reason that, as mentioned earlier, many automated verifiers do not handle closures, because they lift function arguments into the pure, first-order logic of SMT, which cannot abstract over heap manipulation.
While separation logic can, it says nothing about exceptions/effects.
One would need some kind of (monadic) encoding or [protocol](https://devilhena-paulo.github.io/thesis/de-vilhena-thesis.pdf), a fundamentally different specification.

# Staged logic

Taking a step back, why did we have to abstract away the behavior of $f$ to begin with?

The problem was that it was difficult to represent (1) unknown higher-order effectful calls and (2) ordering of effects precisely in pre/post specifications.
Our idea is thus to generalize Hoare triples with the ingredients required to represent them.

Suppose we think of the traditional $\mathbf{req}$ and $\mathbf{ens}$  as propositions in some new logical language $\varphi$ for describing effectful behavior.

$$\varphi ::= \req{P} \mid \ens{Q} \mid ...$$

$P$ and $Q$ are symbolic-heap separation logic formulae,

$$D,P,Q ::= \sigma{\wedge}\pi \quad \quad \quad \sigma ::= \emp \mid x{\mapsto}y \mid \sigma * \sigma \mid ...$$

and $\mathbf{req}$ may be thought of as a separation logic *assert* (or *exhale*, in Viper terms, which requires the presence of a portion of heap and consumes it), and $\mathbf{ens}$ as the dual notion of *assume* (or *inhale*, which produces a portion of heap).

We then extend this language with two new constructs: sequencing and (un)interpreted relations.

$$\varphi ::= \req{P} \mid \ens{Q} \mid \varphi; \varphi \mid f(x, r) \mid \exists x.\ \varphi \mid \varphi \vee \varphi$$

<!-- We call $\varphi$ a *staged formula*, for reasons that will be explained shortly. -->
<!-- $\sigma{\wedge}\pi$ is a symbolic-heap separation logic formula. -->

What is the semantics of such formulae? We defer a detailed answer to our paper[^2], but a first approximation is the following generalization, starting from the (partial correctness) semantics of Hoare triples.

$$
\begin{align*}
\s{P}\ e\ \s{Q} \equiv & \ \forall s, s'. \langle s, e \rangle \longrightarrow \langle s', v \rangle \wedge (s\vDash P) \Rightarrow \langle s',v \rangle \vDash Q \\\\
\s{P}\ e\ \s{Q} \equiv & \ \sb{\ens{\emp}}\ e\ \sb{\req{P}; \ens{Q}} \\\\
\end{align*}
$$

Suppose we redefined Hoare triples in terms of a new "bold" kind of triple, with the new formula type on both sides.
Intuitively, the formula on the left describes a "history", while the formula on the right describes the behavior of $e$ on top of that history.

This is a specific case of this new kind of triple.
The more general case could have its semantics defined as follows.

$$
\begin{align*}
\sb{\ens{\emp}}\ e\\sb{\varphi} \equiv & \ \forall s, s'. \langle s, e \rangle \longrightarrow \langle s', v \rangle \Rightarrow \langle s, s', v \rangle \vDash \varphi
\end{align*}
$$

Now we can clearly see how this new kind of triple generalizes the standard one: where we previously had a precondition $P$ constraining the initial state $s$, and a postcondition $Q$ constraining the final state $s'$ and result $v$, we now have a formula constraining the same three things, with the ability to have an arbitrary number of assertions.

To give a flavour of some reasoning rules, here is the standard separation logic rule for load/deference, followed by our new one.

$$
\frac{}{\s{x \mapsto y}\ !x\ \s{ r.\ x\mapsto y \wedge r =y }} \text{\scriptsize SLDeref}
$$

$$
\frac{}{\sb{\varphi}\ !x\ \sb{\varphi; \exists y, r.\ \req{x\mapsto y}; \ens{r.\ x\mapsto y \wedge r=y} }} \text{\scriptsize StDeref}
$$

<!-- https://github.com/KaTeX/KaTeX/issues/471 -->

It shouldn't be too surprising, as it mostly follows the schema we just presented.

The advantage of having the precondition on the right becomes clearer with the rule for function application, which is the first place where our new logic fundamentally differs.

$$
\frac{(\forall y.\ \s{P_f}\ f(y)\ \s{ r.\ Q_f }) \quad P \vdash P_f[x/y] * F}{\s{P}\ f(x)\ \s{ r.\ Q_f[x/y] * F } } \text{\scriptsize SLApp}
$$

$$
\frac{}{\sb{ \varphi }\ f(x)\ \sb{ \varphi; \exists r.\ f(x,r) }} \text{\scriptsize StApp}
$$

First, we have the standard separation logic rule for function application. The key part is that some *knowledge* or *specification* of $f$ is required to prove that it is safe to call in a state satisfying $P$. Once this is done via the entailment on the right, a postcondition $Q_f$ (with appropriate substitutions) and frame $F$ are produced, allowing us to continue.

On the other hand, the new rule requires no knowledge of the function being called, and can hence work even when $f$ is completely unknown, as is the case when it is a possibly effectful function parameter.
Placing the precondition on the right essentially allows us to defer checking it until a later.

We call this new language of formulae *staged logic*. It consists of the following ingredients.

1. Sequencing and uninterpreted relations
2. Recursive formulae
3. Re-summarization of recursion (lemmas)
4. Compact sequences of pre/post stages using biabduction

The insight is that these allow us to *defer abstraction* until appropriate.

We go over each in turn using examples, then present solutions to the clients we couldn't verify earlier before concluding.

## Effectful placeholders

Consider the following toy heap-manipulating program. $hello$ is an effectful higher-order function, as it calls an unknown function $f$.

```ocaml
let hello f x y =
  x := !x + 1;
  let r = f y in
  let r2 = !x + r in
  y := r2;
  r2
```

Here is a possible specification for it.

$$
\begin{array}{l}
\m{hello}(f, x, y, res) = \\\\
\quad \exists a.\ \req{x{\mapsto}a}; \ens{x{\mapsto}a{+}1} \\\\
\quad \exists r.\ f(y, r); \\\\
\quad \exists b.\ \req{x{\mapsto}b * y{\mapsto}\_}; \\\\
\quad \phantom{\exists b.\ } \ens{x{\mapsto}b * y{\mapsto}\m{res}{\wedge}\m{res}{=}b{+}r} \\\\
\end{array}
$$

Sequencing and uninterpreted relations together allow us to leave placeholders for unknown function parameters, to represent their effects.

Stateful behavior is otherwise *compacted* into a single $\textbf{req}$/$\textbf{ens}$ pair.

<!-- $f$ may be seen as *stratifying* the behavior of $\m{hello}$ into two *stages* under [compaction](#compaction-via-biabduction), hence the name "staged formulae", in allusion to *staged programming*. -->

One might wonder why we must require the presence of $x$ and $y$ after the call to $f$.
For $y$, this is easy, as it is passed as an argument to $f$, and we have to require that it is not, e.g., deallocated.
Interestingly, we also cannot assume anything about $x$ after the call to $f$. As $f$ is unknown and arbitrary, it is possible that it may capture $x$ and cause it to have a potentially different value after, $b$.

Another detail is that this specification assumes that $x$ and $y$ are not aliased. Details on how to relax this assumption are in the paper[^2].

<!--

Sequencing of multiple effectful functions can be represented directly.

```ocaml
let compose f g x = f (g x)
```

$$
\m{compose}(f, g, x, \m{res}) = \exists r.\ g(x, r); f(r, \m{res})
$$

-->

## Recursion

Recursive programs are naturally represented by recursive specifications.

<!-- under a least fixed point interpretation -->

```ocaml
let foldr f a l =
  match l with
  | [] => a
  | h :: t =>
    f h (foldr f a t)
```

here is a staged logic specification for it:

$$
\begin{array}{l}
\foldr(f, a, l, \m{res}) = \\\\
\quad \phantom{\vee\ } \ens{l{=}[]{\wedge}\m{res}{=}a} \\\\
\quad \vee\ \exists r, l_1.\ \ens{l{=}x{::}l_1}; \foldr(f, a, l_1, r); f(x, r, \m{res})
\end{array}
$$

Most importantly, the call to $f$ can be represented directly, without abstraction.

This specification looks very much like the program, because there is no state that could benefit from being expressed with separation logic.
However, it is still an abstraction of the program.

Comparing this to the previous specification, this time expressed as a single $\mathbf{req}$/$\mathbf{ens}$ pair in staged logic,

$$
\begin{array}{l}
\foldr(f, a, l, \m{res}) = \\\\
\quad \exists P, \inv, \xs.\ \req{\m{List(l, \xs)} * \inv([], a) \wedge \m{all}(P, \xs)} \\\\
\qquad \wedge f(x, a', r) \sqsubseteq (\exists ys.\ \req{\inv(\ys, a') \wedge P(x)}; \ens{\inv(x{::}\ys, r)}); \\\\
\quad \ens{\m{List}(l, \xs) * \inv(\xs, \m{res})}
\end{array}
$$

we see that it is longer and more complex, and contains all kinds of paramterization to make up for the inability to speak simply about ordering.
Leaving the recursion in the specification *before* we are aware of what clients expect (and thus, what kind of abstraction is appropriate) is what allows staged specifications to be more precise.

<!-- not precise when it comes to concurrency due to summary of stateful behavior, which may no longer be atomic -->

## Re-summarization

We previously saw function calls represented without any abstraction in specifications, which probably wouldn't work well in large programs.
We would hence like to recover abstraction at some appropriate time.
That time tends to be at calls;
given a use of $\foldr$ such as the following, which passes a closure as an argument,

```ocaml
let foldr_sum_state x xs init =
  let g c t = x := x + 1; c + t in
  foldr g xs init
```

and a user-provided specification (below), we can verify the above program by proving the following entailment.

$$
\begin{array}{rl}
& \forall x, \xs, \m{init}, \res.\ \m{foldr\\_sum\\_state}(x, \xs, \m{init}, \res) \\\\
\sqsubseteq & \exists i,r.\ \req{x{\mapsto}i}; \ens{x{\mapsto}i{+}r{\wedge}\res{=}r{+}\m{init}{\wedge}r{=}\m{sum}(\xs)}
\end{array}
$$

This may also be seen as a means of *recovering abstraction*,
or *re-summarizing* the relatively low-level staged specification,
to get rid of recursion and explicit occurrences of unknown functions
and produce a simpler, non-recursive summary of its behavior.

This example also demonstrates the utility of staged logic,
which allows us to very plainly state the effectful behavior of the program,
and also *prove the entailment automatically*.

In the paper[^2], we define a set of syntactic proof rules for reducing $\sqsubseteq$-entailments (modulo *compaction*) into separation logic proof obligations,
which can be discharged using an off-the-shelf SL prover and SMT.
This particular proof uses an inferred (or provided, in general) induction hypothesis.

## Compaction via biabduction

The final piece is *compaction*, which allows us to have the expressiveness of stages, but also the *succinctness* of triples when the extra expressiveness is not needed.
In short, it allows any staged formula to always be transformed into the following normal form.

$$
\big(\req{\sigma{\wedge}\pi}; \ens{\sigma{\wedge}\pi}; f(x, r); \big)^* \req{\sigma{\wedge}\pi}; \ens{\sigma{\wedge}\pi}
$$

Compaction can be seen as a normalization procedure for (programs represented as) staged formulae.
This is key not only for entailment proofs, but for automation:
in our prototype, users only need to provide essential lemmas, and all other intermediate specifications are derived mechanically.
In this way, compaction functions as a means of specification inference in a verification setting.

We'll illustrate it by example on the heap-manipulating $\m{hello}$ program we saw earlier.

$$
\begin{array}{l}
\m{hello}(f, x, y, res) = \\\\
\quad \exists a.\ \req{x{\mapsto}a}; \ens{x{\mapsto}a{+}1} \\\\
\quad \exists r.\ f(y, r); \\\\
\quad \exists b.\ \req{x{\mapsto}b * y{\mapsto}\_}; \\\\
\quad \phantom{\exists b.\ } \ens{x{\mapsto}b * y{\mapsto}\m{res}{\wedge}\m{res}{=}b{+}r} \\\\
\end{array}
$$

This specification is already in normal form, but suppose we find out an interpretation for $f$, for example, from the following client.

```ocaml
let z = ref 0 in
let y = ref 1 in
hello (fun _ -> incr z; 0) z y
```

Now we have the following interpretation for $f$.

$$f(\_,\res) = \exists c.\ \req{z{\mapsto}c}; \ens{z{\mapsto}c{\wedge}\res{=}0}$$

Unfolding $f$ in $\m{hello}$ (and doing some renaming),

$$
\begin{array}{l}
\m{hello}(f, z, y, res) = \\\\
\quad \exists a.\ \req{z{\mapsto}a}; \boxed{\ens{z{\mapsto}a{+}1}} \\\\
\quad \exists r,c.\ \boxed{\req{z{\mapsto}c}}; \ens{z{\mapsto}c{\wedge}r{=}0} \\\\
\quad \exists b.\ \req{z{\mapsto}b * y{\mapsto}\_}; \\\\
\quad \phantom{\exists b.\ } \ens{z{\mapsto}b * y{\mapsto}\m{res}{\wedge}\m{res}{=}b{+}r} \\\\
\end{array}
$$

This specification is not in normal form.
Focusing on the boxed portions, we see an $\mathbf{ens}$ followed by a $\mathbf{req}$.
We can apply the following normalization rule.

$$
\frac{D_A * D_1 \vdash D_2 * D_F}{\ens{D_1};\req{D_2} \Rightarrow \req{D_A}; \ens{D_F}}
$$

In other words, it suffices to solve a [biabductive entailment](https://fbinfer.com/docs/separation-logic-and-bi-abduction/) to infer a pair of *frame* (in the separation logic sense) and *antiframe* (an additional condition $D_A$ required for $D_1$ to entail $D_2$).
We can then use these in place of the original conditions, "swapping" them around, or "pushing" the $\mathbf{req}$ "through" the $\mathbf{ens}$.

For this example, one solution is:

$$
z{\mapsto}a{+}1 * (a{+}1{=}c) \vdash z{\mapsto}c * \emp
$$

We can thus transform $\m{hello}$ as follow.

$$
\begin{array}{l}
\m{hello}(f, z, y, res) = \\\\
\quad \exists a.\ \boxed{\req{z{\mapsto}a}; \exists c.\ \req{a{+}1{=}c}} \\\\
\quad \exists r.\ \boxed{\ens{\emp}; \ens{z{\mapsto}c{\wedge}r{=}0}} \\\\
\quad \exists b.\ \req{z{\mapsto}b * y{\mapsto}\_}; \\\\
\quad \phantom{\exists b.\ } \ens{z{\mapsto}b * y{\mapsto}\m{res}{\wedge}\m{res}{=}b{+}r} \\\\
\end{array}
$$

Now we have two consecutive $\mathbf{req}$ and $\mathbf{ens}$ stages.
We can normalize them using the following rules.

$$
\req{D_1}; \req{D_2} \Rightarrow \req{(D_1 * D_2)} \\
\ens{D_1}; \ens{D_2} \Rightarrow \ens{(D_1 * D_2)}
$$

Now we have this, and again we have another $\mathbf{ens}$/$\mathbf{req}$ pair.

$$
\begin{array}{l}
\m{hello}(f, z, y, res) = \\\\
\quad \exists a,c.\ \req{z{\mapsto}a * a{+}1{=}c}; \\\\
\quad \exists r.\ \boxed{\ens{z{\mapsto}c{\wedge}r{=}0}} \\\\
\quad \exists b.\ \boxed{\req{z{\mapsto}b * y{\mapsto}\\_}}; \\\\
\quad \phantom{\exists b.\ } \ens{z{\mapsto}b * y{\mapsto}\m{res}{\wedge}\m{res}{=}b{+}r} \\\\
\end{array}
$$

Here's the solution...

$$
z{\mapsto}c{+}1{\wedge}r{=}0 * (c{+}1{=}b{\wedge}y{\mapsto}\_) \vdash z{\mapsto}b * y{\mapsto}\_ * r{=}0
$$

... and final state, after one more round of simplification (not shown).

$$
\begin{array}{l}
\m{hello}(f, z, y, res) = \\\\
\quad \exists a,c.\ \req{z{\mapsto}a * y{\mapsto}\_ \wedge a{+}1{=}c{\wedge}c{+}1{=}b}; \\\\
\quad \exists b.\ \ens{z{\mapsto}b * y{\mapsto}\m{res}{\wedge}\m{res}{=}b}
\end{array}
$$

Now the specification for this call to $\m{hello}$ is in normal form, and we can use it for subsequent reasoning.
We see also that it precisely captures the aggregate behavior of this call, including the state changes.

# Solutions to problematic examples

Going back to the problematic clients we highlighted previously,
how can we tackle them using staged logic,
and how does the approach differ from the invariant-based way of writing specifications given in the introduction?

All the following assume the specification for $\foldr$ is as given in the previous section.
Crucially, none have to change it to solve all problems.

## Example 1

```ocaml
let foldr_ex1 l = foldr (fun x r -> let v = !x in
                                    x := v+1; v+r) l 0
```

An invariant to tell us about the content of the list is not needed.
Instead, we describe the final content of the list in terms of the initial content using a pure function $\m{mapinc}$, alongside the result.
The list is described using a shape predicate.

$$
\begin{array}{rl}
& \m{foldr\_ex1}(l,\res) \\\\
\sqsubseteq & \exists \xs, \ys.\ \req{\list(l,\xs)}; \ens{\list(l,\ys){\wedge}\m{mapinc}(\xs){=}\ys{\wedge}\m{sum}(\xs){=}\res}
\end{array}
$$

<!--

$$
\begin{array}{l}
\m{mapinc}(\xs, \ys) = \\
\quad \phantom{\vee\ } (\xs{=}[]{\wedge}\ys) \\
\quad \vee\ (\exists x, \xs_1, \ys.\ \xs{=}x{::}\xs_1{\wedge}\ys{=}(x{+}1){::}\ys_1) \wedge \m{mapinc}(\xs_1, \ys_1) \\ \\
\list(l, \m{rs}) = \\
\quad \phantom{\vee\ } (\emp{\wedge}l{=}[]) \\
\quad \vee\ (\exists x, \m{rs}_1, l_1.\ x{\mapsto}r * \list(l_1,\m{rs}_1){\wedge}l{=}x{::}l_1 {\wedge} \m{rs}{=}r{::}\m{rs}_1)
\end{array}
$$

-->

## Example 2

```ocaml
let foldr_ex2 l = foldr (fun x r -> assert(x+r>=0); x+r) l 0
```

To enable the assertion in the function argument to be proved, we explicate the assumption that all suffix-sums of the list are positive using a pure function of $l$. This can be directly given as part of the user-provided specificaton on the right.

$$
\m{foldr\_ex2}(l,\res) \sqsubseteq \req{\m{allSPos}(l)}; \ens{\m{sum}(l,\res)}
$$

In this example, we are not concerned with shapes, and fittingly, shape predicates do not appear at all in the specification or lemma.

<!--
$$
\begin{array}{l}
\m{allSPos}(l) = \\
\phantom{\vee\ } (l{=}[]) \\
\vee\ (\exists x, r, l_1.\ l=x{::}l_1 \wedge \m{allSPos}(l_1)\wedge \m{sum}(l,r) \wedge r{\geq}0)
\end{array}
$$
-->

## Example 3

```ocaml
let foldr_ex3 l = foldr (fun x r -> if x>=0 then x+r
                                    else raise Exc()) l 0
```

An exception can be modelled as an *interpreted* relation (more on the semantics of handlers in our ICFP 2024 paper[^3]).

<!-- Given a pure function to describe lists containing only positive elements,

$$
\begin{array}{l}
\m{allPos}(l) = \\
\phantom{\vee\ } (l{=}[]) \\
\vee\ (\exists x, l_1.\ l=x{::}l_1 \wedge \m{allPos}(l_1)\wedge r{\geq}0)
\end{array}
$$

-->

We can give a precise description of the conditions under which an exception is thrown via the following entailment.

$$
\m{foldr\_ex3}(l,\res) \sqsubseteq \ens{\m{allPos}(l){\wedge}\m{sum}(l,\res) \vee \ens{\neg\m{allPos}(l)}; \m{Exc}()}
$$

The underlying logic is still symbolic-heap separation logic; we do not delegate effects to it.
Staged logic may thus be seen as a behavioral layer on top of separation logic, which excels when one is describing individual program states.

# Conclusion

We have described *staged logic*, a generalization of Hoare triples for specifying effectful higher-order programs and verifying them in an automated setting.

It fits well into the standard workflow of automated program verifiers:
given a program and a property it should satisfy,
a staged formula is derived from the program,
and the resulting entailment is automatically proved,
with lemmas and induction hypotheses provided by the user.

Since staged logic generalizes Hoare logic,
one can easily "fall back" to triples in cases where the expressiveness of stages is not needed,
and employ abstraction, invariants, and all the other techniques which have been developed for program proofs.
There is no need to always specify programs as disjunctions of paths, or always capture the ordering of every function call and effect,
however the crucial thing is that *the option to do so is available* where it makes specifications more natural.

Check out our paper[^2] for the details.

These ideas have been implemented in a prototype verifier called [Heifer](https://github.com/hipsleek/heifer), which we hope will grow into a practical verification tool for real programs.

[^1]: Taken from the [Iris lecture notes](https://iris-project.org/tutorial-pdfs/iris-lecture-notes.pdf), pg 32

[^2]: Our FM24 paper may be found [here](https://raw.githubusercontent.com/hipsleek/Heifer/StagedSL/docs/FM2024_TR.pdf)

[^3]: Our ICFP24 paper may be found [here](https://www.comp.nus.edu.sg/~yahuis/ICFP24/ICFP2024.pdf)
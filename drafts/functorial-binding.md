---
title: "The functorial approach to binding"
date: 2025-11-27
math: false
---

I became aware of a very interesting library recently.
It uses a combination of dependent types and typeclasses to support a surprisingly usable and boilerplate-free approach to the representation of binders.

<!-- It's so cutting edge that the paper points to a subdirectory of a recent formalisation for the latest source code. -->

It deserves to be more widely known, so here is a small tutorial covering
the intuition behind it, and how to use it,
with a minimum of category theory.

```coq
From Stdlib Require Import Utf8.
Require Import Binding.Lib Binding.Set.
```

We'll use a lambda calculus to explain the key ideas.

First, a syntax `expr` can be thought of as a functor over some type of variables `V`.

We define it as follows.

```coq
Inductive expr (V : Set) : Set :=
  | ret : val V → expr V
  | app : expr V → expr V → expr V

with val (V : Set) : Set :=
  | var : V → val V
  | lam : expr (inc V) → val V.

Arguments ret {V} v.
Arguments app {V}.
Arguments var {V} x.
Arguments lam {V} e.
```

<!-- (* Coercion ret : val >-> expr. *) -->

The only unexpected thing is that we have an extra `inc` constructor in the type of the lambda body, to indicate the presence of a binder.
There is otherwise no explicit binder, similar to the use of de Bruijn indices.

With this, `V` may be more appropriately thought of as a *scope*: a set of free variables that may occur in a given `expr V`.
More on this in a bit.

## First, does the functorial view buy us?

For one, `fmap`, of type `(A → B) → expr A → expr B`, corresponds to *renaming*: replacing the variables with of type `A` at the leaves of a term with variables of type `B`, preserving the structure of the term.

For another, *a substitution* can be thought of as a function `A → expr B`. This makes sense because it maps variables to expressions of a possibly-different scope.

*The action of substitution* takes a substitution and an expression and produces an expression, i.e. it has type `(A → expr B) → expr A → expr B`, which is just monadic bind.

Both of these hint at structure that we can take advantage of: some way to factor out lemmas relating to renaming and substitution, so developments don't have to be bogged down with them.

Let's get these definitions and some boilerplate out of the way, so we can see some examples.

```coq
#[global]
Instance SetPureCore_val : SetPureCore val :=
  { set_pure := @var }.

Fixpoint emap {A B : Set} (f : A [→] B) (e : expr A) : expr B :=
  match e with
  | ret v => ret (vmap f v)
  | app e1 e2 => app (emap f e1) (emap f e2)
  end

with vmap {A B : Set} (f : A [→] B) (v : val A) : val B :=
  match v with
  | var x => var (f x)
  | lam e => lam (emap (lift f) e)
  end.

#[global]
Instance FunctorCore_emap : FunctorCore expr := @emap.
#[global]
Instance FunctorCore_vmap : FunctorCore val := @vmap.

Fixpoint ebind {A B : Set} (f : A [⇒] B) (e : expr A) : expr B :=
  match e with
  | ret v => ret (vbind f v)
  | app e1 e2 => app (ebind f e1) (ebind f e2)
  end

with vbind {A B : Set} (f : A [⇒] B) (v : val A) : val B :=
  match v with
  | var x => f x
  | lam e => lam (ebind (lift f) e)
  end.

#[global]
Instance BindCore_ebind : BindCore expr := @ebind.

#[global]
Instance BindCore_vbind : BindCore val := @vbind.
```

The only nonstandard things in the definitions were the use of infix operators `[→]` and `[⇒]` where we would expect function arrows `→`, and the `lift` combinator.

`A [→] B` can roughly be understood as `A → B`, and `A [⇒] B` as `A → expr B`.
The latter is a substitution.

`lift` lifts both of these over `inc` constructors: Its type is, roughly, `(A [→] B) → inc A [→] inc B`.

(This is a simplified, specialisd view, to get some intuition before we are exposed to the full generality of the library.)

<!-- A [⇒] B == Sub A B =~ A → F B but with more instances -->

With the definitions down, we can look at some examples.

## Well-scoped terms

First, we have that the types of terms tell us how many free variables occur in them.
In other words, this is a well-scoped representation.
A `val ∅` is a closed term.

```coq
Definition a1: val ∅ := lam (ret (var (&0))).

Definition a4: val (inc ∅) := var (&0).
Definition a2: val (inc ∅) := lam (ret (var (&1))).
```

`&0` and `&1` are variables, represented as de Bruijn indices,
with types `inc ∅`, `inc (inc ∅)`, etc.

```coq
Definition b1 : inc ∅ := &0.
Definition b3 : inc (inc ∅) := &1.
```
`∅` is defined as `Empty_set`, so it has no inhabitants, which is consistent with how it denotes the absence of free variables.

Next, the number of free variables is an overapproximation of how many free variables there actually are in a term.
In other words, *weakening* of scopes is allowed by construction.

Here we have an identity function, but we've given it a type indicating that it has up to one free variable.
This is fineing
It is also fine to give `&0` a similarly more "permissive" type.

<!-- (* weakening allowed in polymorphic setting *) -->
<!-- (* Definition a5: val (inc ∅) := a1. *) -->

```coq
Definition a3: val (inc ∅) := lam (ret (var (&0))).

Definition b2 : inc (inc ∅) := &0.
```

Expressions with multiple free variables can be typed by weakening appropriately.

```coq
Definition a10 : expr (inc (∅)) := ret (var (&0)).
Definition a11 : expr (inc (inc (∅))) := ret (var (&0)).

Definition a13 : expr (inc (inc ∅)) := ret (var (&1)).

Definition a12 : expr (inc (inc (∅))) := app a11 a13.
```

## Substitution

The substitution operation used to descend into lambda bodies is called `subst`.
It has type `expr (inc A) → expr A → expr A`, consistent with how it removes one free variable.

```coq
Definition a42 (v: val (inc ∅)) : val ∅ := subst v a1.
```

<!-- Definition a41 (v: expr (inc ∅)) : expr ∅ := subst v a1. -->

<!--

```coq
Inductive contr {V : Set} : expr V → expr V → Prop :=
| contr_beta : ∀ e (v : val V),
    contr (app (ret (lam e)) (ret v)) (subst (Inc:=inc) e v)
.

Print contr.
Print a1.
Print a2.
(* Set Printing All. *)
(* Check subst. *)
(* Print subst. *)
Print mk_subst.
Print bind.
Print contr.

Goal forall v, exists (e:expr ∅), e = subst v a1.
Abort.

(* Set Printing All. *)
Print a1.

Definition a7 : val ∅ := subst a2 a1.

(* how to produce a substitution? *)
Locate "[⇒]".
Print Sub.

(* weakening is already possible at this level *)
(* Definition b4 : inc (inc ∅) := VS (VS VZ). *)
(* this doesn't typecheck *)

```
-->

What is typically called *parallel substitution*, where a substitution is applied to a term, is called `bind`.
Here is an instance of it with a specialised type.

```coq
Definition a6 (γ: (inc ∅) [⇒] ∅) (a: val (inc ∅)) : val ∅ :=
  bind γ a.
```

Typically we will quantify over substitutions of a given type (commonly, `γ : V [⇒] ∅`, to say that the codomain consists of closed values),
and not construct one manually, but here's how one can be made out of a function,
to give some intuition for how things work.

```coq
Definition a8 (a: val (inc ∅)) : val ∅ :=
  let γ1 : (inc ∅) [⇒] ∅ := Build_Sub val _ _ _ (fun s => a1) in
  bind γ1 a.
```

The parameter `s` can be matched on to replace a specific variable.
Very interestingly, the type of the substitution `γ` constrains what `s` can be!
The match on `s` is exhaustive even though we only cover the `&0` case... given enough annotations.
`&0` is notation for `NZ`.

In words, `γ` replaces only one free variable, and we have to give a value for only that one.

```coq
Definition a9 (a: val (inc ∅)) : val ∅ :=
  let γ : (inc ∅) [⇒] ∅ := Build_Sub val _ _ _ (fun s =>
    match s with
    | NZ => a1
    end)
  in
  bind γ a.
```

<!--
```coq
Goal forall v, exists (v1:val ∅), v1 = subst v a1.
Abort.

Definition a22: val (inc (inc ∅)) := lam (ret (var (&2))).
Definition a22': val (inc (inc ∅)) := lam (ret (var (&0))).

(* a2 = (λ x. y), has one free variable *)
Print a2.
Goal forall γ,
  γ = Build_Sub val _ _ _
  (* (inc (inc ∅)) (inc ∅) *)
    (fun (s:inc ∅) => match s with
    (* | VS VZ => a1 *)
    | VZ => a1 (* we can only target that free variable? *)
    (* this can only be zero so the substitution can only be filled to this extent *)
    (* | VS VZ => a1 *)
    | _ => a1 (* we can give this but it will not be used *)
    end) →
  exists (v1:val ∅), v1 = bind γ a2.
  intros.
  unfold bind.
  (* substitution is a function, so we can use it to bind *)
  unfold BindCore_vbind.
  unfold a2.
  unfold vbind.
  (* bind is defined in terms of lifting *)
  (* lifting substitution to ? *)
  (* Set Printing All. *)
  (* Unset Printing Notations. Set Printing Coercions. Set Printing Parentheses. *)
  (* Print lift. *)
  (* Print LiftableCore. *)
  unfold lift, SLiftableCore_inc.
  (* lifting is defined in terms of shifting *)
  unfold nth_inc.
  (* unfold apply_sub. *)
  simpl.
  Check shift.
  (* need to know about γ to continue *)
  (* apply subst to 0, then shift. shift because we went under a lambda? *)
  (* zero is also in inc ∅, the sub kept its type *)
  (* the weird part is how we're now looking up something different in the sub? *)
  (* if the sub were mapping 1 to something, now it's targeting zero *)
  (* the type says the sub maps 0 to emp, but idk *)
  (*

    For example, if we substitute 0 1 (both free vars) for the variable bound by the
    outermost λ in λ.λ.1 we should get λ.λ.2 3, not λ.λ.0 1.

    we shift 0 1 by 2. this gives us 2 3.
    this can be done shifting after replacing, or shifting the codomain of the substitution list.

    do we change the var we're substituting /for/?
  *)
  (* the shift is right. it's being applied to the codomain *)
  (* the problem is the var we're looking up in the sub changed,
    and the sub didn't change *)
  (* the fix is that the type ensures we can only target that free variable... *)
Abort.

Definition a81 (a: val (inc ∅)) : val ∅ :=
  let γ1 : (inc ∅) [⇒] ∅ := Build_Sub val _ _ _
    (fun s => match s with
    (* | VS VZ => a1 *)
    | VZ => a1
    | _ => a1
    end) in
  bind γ1 a.

(* V [⇒] ∅, usually, just saying that the codomain is all closed values.
  it's hard to make a subst that targets multiple values *)

Unset Printing Notations. Set Printing Coercions. Set Printing Parentheses.
(* Set Printing All. *)
Print a8.

Locate "≡".
Locate equal.
Print equal.
Print EqCore.
Check bind_pure.
Check bind_pure'.

Check (ret (var (&0))).
(* like the empty list *)
Check nil.

Check (ret (var (&0 : inc ∅))).

(* multiple free vars *)

(* Print a10.
Print a11. *)
```
-->

<!--
(* Check mk_subst. *)

  (* substitute a1 into a *)

  (* lam (ret (var (&1))). *)

(* equality? *)

-->

## Experiences with this approach in formalisations

<!-- ## Tradeoffs -->

<!-- TODO ours -->

A great showcase of what the library can do is the formalisation for the paper [Untyped Logical Relations at Work: Control Operators, Contextual Equivalence and Full Abstraction](https://github.com/ppolesiuk/untyped-logrel).

We are developing a formalisation in similar style.

<!-- TODO -->
<!-- We have developed a formalisation in similar style. -->

The use of a well-scoped representation shines when definitions pertain to e.g. closed terms only. Associating the closedness property with terms by construction not only saves us from re-proving the same closedness obligations over and over, but seems more expressive than explicit premises, as it is possible to carry around such assumptions without having to prove them in cases where the definition appears contravariantly.

For example, when proving transitivity of a relation, if closedness premises as used, we will not not be able to prove closedness about the middle element; the appropriate place for the property is together with the element, and not in the relation.

```coq
Parameter exp : Type.
Parameter closed : exp → Prop.
Parameter related : exp → exp → Prop.

Definition rel (e1 e2: exp) : Prop :=
  closed e1 → closed e2 → related e1 e2.

From Stdlib Require Import Classes.RelationClasses.

Goal Transitive rel.
  unfold Transitive, rel. intros.
  (* we are stuck, as we cannot prove y is closed *)
Abort.
```

<!-- Generally type annotations have to be supplied. -->

The big question: how does this compare to a first-order representation of names, like de Bruijn indices with Autosubst?
It's better in some ways but worse in others.
Better because the syntax is well-scoped by construction, and many properties come for free.
Worse because more annotation is needed. Perhaps this is an artifact of the typeclass-heavy design of the library, and could be lessened by making it less generic.

<!-- [[https://ii.uni.wroc.pl/~ppolesiuk/papers/coqpl2024.pdf][paper]]
[[https://homepages.inf.ed.ac.uk/gdp/publications/Abstract_Syn.pdf][FPT paper]]
[[https://www.youtube.com/watch?v=2CNR62apGFI][coqpl presentation]]
[[https://github.com/ppolesiuk/untyped-logrel][latest code]] -->


<!--
A sub is an arrow
Fmap bind


Objects are free names
Arrows are renamings
Substituting is a renaming into a term
Fmap

Two free names, then how? They are represented as 1 and 2 values, with types inc and inc inc

Given it's a type of names, can it be strings

-->

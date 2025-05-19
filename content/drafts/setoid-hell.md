---
title: "Getting started with setoid rewriting in Coq"
# title: "The road to setoid hell is paved with typeclass error messages"
date: 2024-10-04
math: true
---

An intuitive look at setoid rewriting

The use case I'm familiar with

When working with a deep embedding of a logic in Coq, you will probably end up needing to face the beast that is setoid rewriting.
The use case for this is rewriting terms using your entailment relation modulo some *interpretation*, which bridges the semantics of your logic and the logic of Coq.

Here's an example.

```coq
From Coq Require Import ZArith.
From Coq Require Import Setoid Morphisms Program.Basics.

Inductive f :=
  | And : f -> f -> f
  | Or : f -> f -> f
  | EqI : Z -> f.

Inductive satisfies : f -> Z -> Prop :=
  | iand : forall f1 f2 m,
    satisfies f1 m ->
    satisfies f2 m ->
    satisfies (And f1 f2) m
  | ior_l : forall f1 f2 m,
    satisfies f1 m ->
    satisfies (Or f1 f2) m
  | ior_r : forall f1 f2 m,
    satisfies f2 m ->
    satisfies (Or f1 f2) m
  | i : forall i,
    satisfies (EqI i) i.

Definition entails f1 f2 : Prop :=
  forall m, satisfies f1 m -> satisfies f2 m.

Lemma and_comm : forall f1 f2, entails (And f1 f2) (And f2 f1).
Admitted.

Lemma or_comm : forall f1 f2, entails (Or f1 f2) (Or f2 f1).
Admitted.

#[global]
Instance Proper_satisfies : Proper (entails ==> eq ==> impl) satisfies.
Proof.
  unfold entails, Proper, respectful, impl.
  intros; subst; eauto.
Qed.

#[global]
Instance Proper_Or : Proper (entails ==> entails ==> entails) Or.
Proof.
    unfold Proper, entails, respectful.
    intros x y H1 a b H2 z H3. inversion H3.
    - apply ior_l. apply H1. auto.
    - apply ior_r. apply H2. auto.
Qed.

#[global]
Instance Reflexive_entails : Reflexive entails.
Proof.
    unfold Reflexive, entails. auto.
Qed.

(* note that the two branches of And need to be distinct for `and_comm` to work *)
Goal satisfies (Or (EqI 1) (And (EqI 1) (EqI 2))) 1.
Proof.
  rewrite <- or_comm. (* Uses Proper_satisfies *)
  rewrite <- and_comm. (* Uses Proper_satisfies, Proper_Or, and Reflexive_entails *)
```

# Setoids

What is a setoid? Other people have explained it better, but it's a type with an equivalence[^1] relation.

TODO li yao post, penn pl club

This relation can be used to rewrite terms deep in some context, provided the relation is *proper* with respect to the context.
This is easier.

```coq
```

This is allowed because.

To enable rewriting, you will have to provide an instance of the `Proper` typeclass.

<!-- Rewriting is accessed using the -->
<!-- in Coq. -->

Proper to show that your relation is a congruence
How to read

Instances

An instance is needed for every enclosing constructor.
For example,

```coq
example
```

This works even if conditional.

Conditional rewriting

```coq
From Coq Require Import ZArith.
From Coq Require Import Setoid Morphisms Program.Basics.
Inductive f :=
  | And : f -> f -> f
  | Or : f -> f -> f
  | EqI : Z -> f.

Inductive satisfies : f -> Z -> Prop :=
  | iand : forall f1 f2 m,
    satisfies f1 m ->
    satisfies f2 m ->
    satisfies (And f1 f2) m
  | ior_l : forall f1 f2 m,
    satisfies f1 m ->
    satisfies (Or f1 f2) m
  | ior_r : forall f1 f2 m,
    satisfies f2 m ->
    satisfies (Or f1 f2) m
  | i : forall i,
    satisfies (EqI i) i.

Definition entails f1 f2 : Prop :=
  forall m, satisfies f1 m -> satisfies f2 m.

Lemma and_comm : forall f1 f2, entails (And f1 f2) (And f2 f1).
Admitted.

Lemma or_comm : forall f1 f2, entails (Or f1 f2) (Or f2 f1).
Admitted.

#[global]
Instance Proper_satisfies : Proper (entails ==> eq ==> impl) satisfies.
Proof.
  unfold entails, Proper, respectful, impl.
  intros; subst; eauto.
Qed.

#[global]
Instance Proper_Or : Proper (entails ==> entails ==> entails) Or.
Proof.
    unfold Proper, entails, respectful.
    intros x y H1 a b H2 z H3. inversion H3.
    - apply ior_l. apply H1. auto.
    - apply ior_r. apply H2. auto.
Qed.

#[global]
Instance Reflexive_entails : Reflexive entails.
Proof.
    unfold Reflexive, entails. auto.
Qed.

(* note that the two branches of And need to be distinct for `and_comm` to work *)
Goal satisfies (Or (EqI 1) (And (EqI 1) (EqI 2))) 1.
Proof.
  rewrite <- or_comm. (* Uses Proper_satisfies *)
  rewrite <- and_comm. (* Uses Proper_satisfies, Proper_Or, and Reflexive_entails *)
```

# Errors and debugging

While futzing around defining proper instances, you will see the dreaded failed to understand

This is a known issue. Unfortunately it's been a known issue for 6 years with no resolution
https://github.com/coq/coq/issues/6141

the typeclass errors can get really large, leaving you with no choice other than to bisect your code until you find the error.
https://github.com/coq/coq/issues/13942

## Heuristics for understanding errors

The Proper instances in the context give you roughly those needed on the way

However they don't give the full story. First enable debug
Gross gives some tips.
https://stackoverflow.com/questions/50989017/proper-instance-for-nested-matching/51015288#51015288

looking for lines with proper_subrelation immediately followed by something about a proper instance tells you when typeclass resolution failed, which typically says something about the instance you need.

unfortunately, typeclass resolution errors show up for a variety of reasons.
it's possible such an error message doesn't occur, and the error is actually about something else.
the worst part is that you still see the Proper instances in the initial error message (without debugging on), so at first glance it seems like it's a missing instance that's causing the problem.

in particular, you get the same error from insufficiently instantiated arguments.
if you try to rewrite with a lemma and don't.

```coq
rewrite (@lem _ a) in H.

(* the more common form, where it's unclear *)
rewrite lem in H.
```

Pass all the arguments to rewrite

as with

---

# What is happening under the hood?


# Conclusion

despite its opaqueness and rough edges, the rewriting system is remarkably robust. i was genuinely impressed that it handled my use cases.

this is used in the formalization of staged logic

Thank you to Li Yao on the coq zhlip for patiently answering my questions.

[^1]: Coq implements so called *generalized rewriting*, where the relation can be weaker than an equivalence; it just has to be a [preorder](https://github.com/coq/coq/blob/master/theories/Classes/RelationClasses.v), which is not symmetric.

<!--

Semantic equality
Deep embedding
Doesn't coincide with syntactic
To rewrite we then need setoid rewriting

It can then be useful to weaken when rewriting
Generalised rewriting

Coq as logical framework
Host for logics


Primitives of coq for setoid blog post
Inductive arrow forall
https://cs.brown.edu/courses/cs195x/current/sf/html/Logic.html

-->

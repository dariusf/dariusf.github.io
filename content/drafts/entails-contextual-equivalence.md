---
title: "From entailment to contextual refinement"
date: 2025-10-29
math: true
mathDefs: |
  \newcommand{\m}[1]{\mathit{#1}}
  \newcommand{\flow}{\varphi}
  \newcommand{\sreq}[1]{\mathbf{req}\ #1}
  \newcommand{\sens}[1]{\mathbf{ens}\ #1}
  \newcommand{\sensr}[2]{\mathbf{ens}\ #1. #2}
  \newcommand{\defeq}{\triangleq}
  \newcommand{\entails}{\sqsubseteq}
  \newcommand{\implies}{\Rightarrow}
  \newcommand{\ctxrefines}{\preceq}
  \newcommand{\ctxequiv}{\equiv^{ctx}}
  \newcommand{\app}[2]{#1\ #2}
  \newcommand{\vlambda}[2]{\lambda #1. #2}
  \newcommand{\bigstep}[4]{\langle #1, #2 \rangle \to \langle #3, #4 \rangle}
  \newcommand{\bind}[1]{; #1.}
---

This post is about one particularly thorny obstacle on the journey to developing a mechanisation of staged logic for my PhD thesis.

First, some background on staged logic.
It is a specification logic for higher-order programs with effects.

Here is the syntax of its formulae. It is an untyped lambda calculus with specifications and logical connectives. $\sigma$ is some formula for describing program states, like a heap formula from separation logic.

$$
\begin{array}{r@{\ }ll}
\flow ::= & \sreq{\sigma} \mid \sensr{r}{\sigma} & \text{Specifications} \\
\mid & \forall x. \flow \mid \exists x. \flow \mid \flow \wedge \flow \mid \flow \vee \flow & \text{Logical connectives} \\
\mid & \vlambda{x}{\flow} \mid \app{\flow_1}{\flow_2} \mid \flow_1\bind{r}\flow_2 \mid \dots & \text{Program contexts}
\end{array}
$$

Like other logics, it comes with an entailment relation, initially defined as follows, where $m$ is a model of the logic.
The symmetric version, *equivalence*, is typically defined in terms of entailment.

$$
\begin{align}
\flow_1 \entails \flow_2 & \defeq m \vDash \flow_1 \implies m \vDash \flow_2 \\
\flow_1 \equiv \flow_2 & \defeq \flow_1 \entails \flow_2 \wedge \flow_2 \entails \flow_1
\end{align}
$$

This definition is known under many names in different communities.

- In other logics, such as [separation logic](https://softwarefoundations.cis.upenn.edu/slf-current/Himpl.html), it is written $\vdash$ and called *entailment*, as a lifting of metalogic implication
- In TLA$^+$, where the two objects are temporal formulae representing state machines, it is written $\sqsubseteq$ and called [refinement](https://www.hillelwayne.com/post/refinement/)
- When the two objects are programs, it is called [program approximation](https://softwarefoundations.cis.upenn.edu/plf-current/Equiv.html), with the symmetric version called *behavioural equivalence*. In the context of compiler correctness, it is also a simple form of forward (or backward, [depending on who you ask](https://sel4.discourse.group/t/forward-vs-backward-simulation-in-the-refinement-proof/490)) simulation
- When the two objects are [languages](https://songyahui.github.io/ICFEM20.pdf), typically representing sets of strings, it is called *inclusion* and written $\subseteq$
- When the two objects are [specifications](https://www.cs.princeton.edu/~appel/papers/funspec_sub.pdf), the relation is written $<:$ and called *subsumption*
- When the two objects are [types](https://www.irif.fr/~gc/papers/icalp-ppdp05.pdf), $<:$ is instead called *subtyping*

Entailment intuitively means that the models or behaviours of $\flow_1$ are somehow "contained in" those of $\flow_2$.
When the operands are some kind of program, $\flow_2$ can be seen as a *specification* of $\flow_1$, as it "bounds" the behaviours the latter can have.
When the operands are logical formulae, $\flow_1$ is called *stronger* or *more precise*, in that it describes fewer models, since every model satisfying it will satisfy $\flow_2$.

We started with this and it [worked great](/MechanizingStagedLogic.pdf) for interactive proofs in Rocq for a while.

## Delimited continuations and the bubble-up semantics

[other blog post](/drafts/delimited-control).

However, there were problems with shift and the bubble-up semantics.
We had shift results and no way to relate them.

$$(\flow_1; \flow_2); \flow_3 \equiv \flow_1; (\flow_2; \flow_3)$$

where sequencing is defined as $\flow_1; \flow_2 \defeq \flow_1 \bind{\_} \flow_2$.

Associativity broke.
Rewriting wouldn't work because proper instances

## Many indexed non-solutions

*gentails*, for "generalised entails".
It also autocorrects poorly.

## A similar problem in the lambda calculus

It turns out that this issue shows up in the lambda calculus.

$$e ::= x \mid \lambda x. e \mid \app{e_1}{e_2}$$

Consider how to prove that these two expressions are equivalent.

$$\vlambda{x}{x} \equiv \vlambda{x}{\app{(\vlambda{y}{y})}{x}}$$

According to the definition above, given that we know how $\vlambda{x}{x}$ evaluates, we have to show that $\vlambda{x}{\app{(\vlambda{y}{y})}{x}}$ evaluates to the same value.

Suppose we have a big-step semantics $\bigstep{h}{e}{h}{v}$.
A lambda expression is a value, and the rule for values just says:

$$\frac{ }{\bigstep{h}{\vlambda{x}{e}}{h}{\vlambda{x}{e}}}\m{Val}$$

In other words, no more evaluation takes place.

If we try this for the two programs above, we end up with distinct syntactic objects that are not equal, though we can so clearly see that they behave the same.

The way I originally described it to people (with the view that staged logic was a logic) was that we had "syntax in the model". Which led to a rabbit hole of looking into denotational approaches to interpret that syntax with.

However, staged logic is equally viewed as an abstract programming language, and though it seems obvious in hindsight, the problem we had with bubbles is exactly the one described here with the lambda calculus.

## Contextual equivalence

The solution is a stronger notion of equivalence: *contextual equivalence* (with the asymmetric version being called *contextual refinement*).

$$
\begin{align}
e_1 \ctxrefines e_2 & \defeq \forall C. C[e_1] \entails C[e_2] \\
e_1 \ctxequiv e_2 & \defeq e_1 \ctxrefines e_2 \wedge e_2 \ctxrefines e_1
\end{align}
$$

It seems [customary](https://www.google.com/search?q=%22contextual+equivalence%22+%22gold+standard%22) to call it the "gold standard" for a notion of equivalence, so I will repeat that here.

Why does it solve the problem? Consider the statement again.

$$\vlambda{x}{x} \equiv \vlambda{x}{\app{(\vlambda{y}{y})}{x}}$$

We know that these expressions are equivalent informally because *no matter the argument we supply to each*, we'll get the same result. We might even have justified this to ourselves by mentally evaluating both sides with some symbolic value $v$ and seeing that we get exactly $v$ at the end.

In other words, if we only had some way to continue evaluating these expressions, we could easily tell that they were equivalent. The problem is that we can't do this, because they are already values - the big-step semantics has nothing more to say about them.

If only we had a way to describe hypothetical, future inputs to those programs...

Well, that's what contextual refinement offers. It quantifies over all contexts, so for all that don't get stuck and produce derivations, we are able to continue running these programs.
In other words, the context gives us a way to talk about how each lambda will eventually be used.

How would we actually prove this particular equivalence?
Direct induction over contexts is known to be ["notoriously difficult"](https://dl.acm.org/doi/pdf/10.1145/3759427.3760374).
The two tenable proof methods are
[bisimulations](https://dl.acm.org/doi/pdf/10.1145/1889997.1890002) and [logical relations](https://cs.au.dk/~birke/papers/AnIntroductionToLogicalRelations.pdf).
I am more familiar with the latter, as it is much more commonly used in mechanised settings.

The idea there is to strengthen the definition of equivalence, so it more precisely says when two expressions are equivalent.
To cope with advanced language features, the definition will have to be inductive over the structure of types and/or the number of evaluation steps the program takes.
<!-- A succinct set of slides describing the idea is [here](https://xavierleroy.org/CdF/2018-2019/8.pdf).
Amal Ahmed's [2015 OPLSS lectures](https://www.youtube.com/playlist?list=PLiHLLF-foEex7BOvMbrbUFC9XgU7fZW66) provide a great and more thorough introduction. -->

It should also come as no surprise that the Proper instances we agonised over for so long are just simple corollaries of contextual equivalence.
Hence this relation can be used for rewriting.

<!-- With that, we were finally able to formalise staged logic. -->

With that, we seem to be finally able to formalise staged logic.

## Conclusion

Discovering all this was a long and agonising journey, as the connections between these topics are typically discussed in very disparate settings.
I still don't know of any source which connects them like this, so I just wanted to put all this in words, so the next person who needs this connection not suffer a similar fate.

I'm grateful to the authors of a paper which pointed this out particularly clearly:
[Program equivalence in an untyped, call-by-value functional language with uncurried functions](https://www.sciencedirect.com/science/article/pii/S2352220823000111).
Moreover, it is for an untyped setting, which is a relatively interesting and unexplored one to apply logical relations in.

---
title: "Self-send projection"
date: 2023-11-28 10:33:45 +0800
math: true
---

$\gdef\kwproj{\mathbin{\upharpoonright}}$
$\gdef\gall#1#2#3{\forall #1 : #2 \cdot #3}$
$\gdef\galls#1#2#3#4{\forall #1 : #2\setminus #3 \cdot #4}$
$\gdef\galle#1#2#3#4{\forall #1 : #2\setminus \\{#3\\} \cdot #4}$
$\gdef\gtransmit#1#2#3{#1 \to #2:#3}$
$\gdef\kwpar{\mathrel{||}}$
$\gdef\spar#1#2{#1 \kwpar #2}$
$\gdef\lsend#1#2{\mathit{send}\ #1\ #2}$
$\gdef\lrecv#1{\mathit{recv\ #1}}$

[Session types](https://wen.works/2020/12/17/an-introduction-to-session-types/) are a neat and fascinating formalism.
Intuitively, they are small languages for describing communication protocols.
Viewing these protocols as types, a type system may be used to check that a program implements a protocol correctly and has other nice properties, such as deadlock-freedom.
Unlike types which constrain data, session types are _behavioral_ specifications and constrain what _programs_ can _do_.

_Multiparty session types_ concern more than two communicating parties and are usually written in ["Alice & Bob notation"](https://en.wikipedia.org/wiki/Security_protocol_notation), specifying a protocol from a so-called _global_ perspective.

Here's the syntax of a tiny MPST language.

$$G ::= a \to b: m\ |\ G; G$$

We can write a type such as

$$a \to b: m; \\\ b \to a: n$$

which specifies a protocol where party $a$ sends the message $m$ to party $b$, and $b$ _then_ replies with message $n$.

Say we have a program that implements party $a$, and we want to check it against the protocol.

```js
function a(m) {
    Send(b, m);
    let n = Receive(b);
}
```

One approach is to split the global type into two _local_ halves, then check the program against the half for $a$.
This splitting operation is called _projection_ because we are keeping only a slice or subpart of the behavior of the overall system, or some subsequences of its execution traces, etc.

Here is a tiny language of local types.

$$L ::= \mathit{send}\ a\ m\ |\ \mathit{recv}\ b\ |\ L; L$$

The projections for $a$ and $b$ would be:

$$L_a : \mathit{send}\ b\ m; \mathit{recv}\ b$$

$$L_b : \mathit{recv}\ a; \mathit{send}\ a\ n$$

How do we compute such a projection?

<!-- We write $G \upharpoonright S$ for the projection of global type $G$ on a set of parties $S$. -->

$$(G_1; G_2) \upharpoonright p \equiv (G_1 \upharpoonright p); (G_2 \upharpoonright p)$$

$$a \to b: m \upharpoonright a \equiv \mathit{send}\ b$$

$$a \to b: m \upharpoonright b \equiv \mathit{recv}\ a$$

The rules are very simple for this tiny language:
projection is "pushed through" sequential composition,
and if we are projecting $\to$ with respect to a given party $p$ and we see $p$ is the sender, the result is a $\mathit{send}$, otherwise it is a $\mathit{recv}$.

<!--

Both $\to$ cases assume $a\neq b$.

<details>
    <summary>What if $a=b$, i.e. how should we project $a \to a: m$?</summary>
    It seems like the result should be $\mathit{send}\ a\ m; \mathit{recv}\ a$. We'll solve this shortly.
</details>

<details>
    <summary>What if $a\neq b \neq m$?</summary>
    The result is a no-op. We don't discuss this for brevity.
</details>

-->

<!-- proof -->

## Multicasts

It would be amazing if we could model a real-world protocol like [Raft](https://raft.github.io/) as a type and have the conformance of an implementation checked automatically and decideably!

We are still quite a long way off.
One major missing ingredient is the ability to express a multicast, the first step in leader election.

Let's extend our language of multiparty session types with a way to talk about communication that happens uniformly across a set of parties, which we'll call a _role_. We'll use the symbol $\forall$ for it, as an analogy to universal quantification.
We'll also add parallel composition $||$.

$$G ::= a \to b: m\ |\ G; G \ |\ G \mathbin{||}G \ |\ \forall x:S \cdot G$$

We can now write a type like

$$\forall p:\mathit{ps} \cdot c \to p: \mathit{prepare}$$

which would suffice for the start of a [commit protocol](https://en.wikipedia.org/wiki/Two-phase_commit_protocol#Basic_algorithm).
Notice that $\forall$ is just n-ary parallel composition for each party in the role.

Projection should give us

$$L_c : \forall p:ps \cdot \mathit{send}\ p\ \mathit{prepare}$$

$$L_p : \mathit{recv}\ c$$

which matches our intuition neatly:

- when we project with respect to the set of coordinators, we want to get a local type which says what _one arbitrary_ coordinator does. Since this coordinator isn't in $ps$ but interacts with every member of $ps$, the quantifier should remain in the local type $L_c$, which correctly captures the multicast.
- when we project with respect to the set of participants, since our arbitrary participant is in $ps$, it is involved in _only one_ $\mathit{recv}$, so the quantifier should disappear.

Here is the projection function for $\forall$, which is now defined with respect to a role $S$.

$$\forall x:S \cdot G \upharpoonright S \equiv G \upharpoonright S$$

$$\forall x:S \cdot G \upharpoonright S' \equiv \forall x:S \cdot (G \upharpoonright S)\\\ (S \neq S')$$

## Self-sends

For leader election, however, we quickly run into a problem.

$$\forall s:\mathit{servers} \cdot s \to s: \mathit{RequestVote}$$

The rules from before don't help us much - do we keep the quantifier or not?
Also, it seems that a server should both $\mathit{send}$ and $\mathit{recv}$, but since there is only one role to project with respect to, we can only have one of those.

We call this sort of intra-role communication a _self-send_.

The paper [Dynamic Multirole Session Types (2013)](http://mrg.doc.ic.ac.uk/publications/dynamic-multirole-session-types/dynamic-multirole-session-types.pdf) proposes an elegant solution, based on the following observation, or lemma: given an arbitrary party $z$ in role $S$, the following types are equivalent.

$$\forall x:S\cdot G\\\ \equiv\\\ G[z/x]\ ||\ \forall x:S\setminus \\{z\\}\cdot G$$

That is, a universal quantification is just the parallel composition of "what $z$ does" and "what everyone else does".
<!-- It turns out that projecting the parallel composition instead solves the problem! -->
<!-- If we project the parallel composition instead, maybe that would solve the problem? -->

The solution is thus to project the parallel composition instead,
with respect to _the party_ $z$, instead of "an arbitrary party of role $S$".
Before, these were equivalent because we didn't need to be sensitive to which party in a role we were concerned with.
<!-- distinguish different parties of the same role. -->

<!-- To get a feel for it, -->
<!-- let's first refine our language a bit. -->

For explicitness, we'll refine $\forall$ with a set of exclusions $e$, which may be empty.

$$G ::= ...\ |\ \forall x:S\setminus e \cdot G$$

<!-- There is a problem, however. This is certainly a valid MPST.
There may be seen as a tiny part of what does, where there is only a single set of nodes exchanging messages, assuming different roles dynamically (e.g. when a leader is elected, or on timeout).
-->

There are two cases for $\forall$.

1. If $z \in S$ but $z \notin e$, i.e. it is possible that the quantifier involves $z$, we first apply the lemma above, which separates the behavior of $z$ from that of everyone else in $S$, then recursively project on both sides.

    $$(\forall x:S\setminus e\cdot G) \kwproj z \equiv (G[z/x] \kwproj z) \kwpar (\forall x:S\setminus (\\{z\\}\cup e)\cdot (G \kwproj z))$$

    Intuitively, the left arm is what $z$ does, while the right is _what other parties do to_ $z$.
    $z$ is involved in both sides of the $\kwpar$ precisely because members of the same set being quantified over are interacting.
    If we were projecting a protocol without a self-send, the right arm would be unobservable and disappear, and we would the same result as the projection function from the previous section!

2. Otherwise (if $z \notin S$ or $z \in e$), we keep the quantifier and project under it, for the same reason as before: $z$ may interact with the parties of role $S$.

    $$(\forall x:S\setminus e\cdot G) \kwproj z \equiv \forall x:S\setminus e\cdot (G \kwproj z)$$

The extension for $\to$ is simple: since we are projecting with respect to $z$, we can just check if an occurrence of communication involves $z$ directly. If it involves $z$ as both sender and receiver, we correspondingly produce both $\mathit{send}$ and $\mathit{recv}$.

<!-- <details> -->
<!-- <summary> -->
Let's walk through an example.
<!-- </summary> -->

$$\begin{array}{rll}
& \gall{x}{C}{\galle{y}{C}{x}{\gtransmit{x}{y}{m}}} \kwproj z & (1) \\\\
= & (\galle{y}{C}{z}{\gtransmit{z}{y}{m}} \kwproj z) & (2) \\\\
& \quad \kwpar (\galle{x}{C}{z}{\galle{y}{C}{x}{\gtransmit{x}{y}{m}}} \kwproj z) \\\\
= & (\galle{y}{C}{z}{(\gtransmit{z}{y}{m} \kwproj z)}) & (3) \\\\
& \quad \kwpar (\galle{x}{C}{z}{(\galle{y}{C}{x}{\gtransmit{x}{y}{m}} \kwproj z)}) \\\\
= & (\galle{y}{C}{z}{\lsend{y}{m}}) & (4) \\\\
& \quad \kwpar (\galle{x}{C}{z}{(\gtransmit{x}{z}{m} \kwproj z} \\\\
& \qquad \kwpar (\galle{y}{C}{z,x}{\gtransmit{x}{y}{m}} \kwproj z))) \\\\
= & (\galle{y}{C}{z}{\lsend{y}{m}}) & (5) \\\\
& \quad \kwpar (\galle{x}{C}{z}{(\lrecv{x}} \\\\
& \qquad \kwpar (\galle{y}{C}{z,x}{(\gtransmit{x}{y}{m} \kwproj z)}))) \\\\
= & (\galle{y}{C}{z}{\lsend{y}{m}}) & (6) \\\\
& \quad \kwpar (\galle{x}{C}{z}{\lrecv{x}}) \\\\
\end{array}$$


The type in (1) represents a protocol where every party in role $C$ pings every other, sending a message and receiving a reply.

In (2), $z$ could be in $C$, so we apply $\forall$ case 1.
In the left arm, we push the projection inward until we are able to project the communication into a $\mathit{send}$ (4).
In the right arm, we add $z$ to the set of exclusions for the quantifier for $x$ and continue (3), but since $y$ may also be $z$, we find ourselves having to apply case 1 again (4).
The left arm there projects to a receive (5), while the right is a no-op, as the communication between $x$ and $y$ is unobservable to $z$.
This gives us the protocol at (6), which says exactly what we started out with.

<!-- </details> -->

<!-- <br> -->

<!-- why reproduce this example? it fixes typos in the paper and comes with more explanation and detail, without skipping steps -->

The title of the paper mentioned earlier should make sense now.
Protocols with self-sends and universal quantification are "multirole" because parties may act as both sender and receiver, and have two distinct classes of behaviors.

The paper uses "dynamic" in the sense that parties can join and leave, and the $\forall$ thus specifies the behavior of a possibly infinite set of parties. We aren't (yet?) concerned with this aspect.
We are, however, concerned with two different senses of "dynamic", which is that roles may be _computed_ in the course of the protocol, or dynamic changes; we return to this shortly.

# Choreographic PlusCal

This is the heart of the projection function that is implemented in [Choreographic PlusCal](/cpluscal), a choreographic specification language I worked on.

It brings the succinctness and clarity of session types to a much more expressive specification language, one which scales up to real-world distributed protocols, which compute and branch, and are much closer to algorithms than sequences of transmissions.

The tradeoff is that Choreographic PlusCal models cannot be verified by simple type checking.
Even properties such as deadlock-freedom cannot be guaranteed with things like `await FALSE;` in the language.
Fortunately, being a PlusCal dialect, it has access to TLC, making it an exceedingly practical point in the design space.

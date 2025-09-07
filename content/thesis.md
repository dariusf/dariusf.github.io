---
title: PhD Thesis
---

# Automated Verification of Effectful Higher-order Programs

This dissertation describes *staged logic*, a new approach to the automated verification of effectful higher-order programs. Such programs are completely natural to write in most programming languages, but are challenging to handle in verifiers, due to the need to reason simultaneously about the ordering and semantics of effects and higher-order control. Today, support for effectful higher-order programs is largely limited to interactive verifiers, each employing disparate, often semantic specification and verification approaches; many automated verifiers either handle them partially or not at all.

Staged logic offers a unified approach to effectful reasoning that is designed to bridge this gap. To support automation, it is syntactic in nature, based on refinement and rewriting. It is simple and general, and scales to complex language features, including effect handlers and delimited continuation operators. It serves as the basis for an automated tool, Heifer, that verifies annotated OCaml programs via SMT, and is mechanised in Rocq. Heifer has been used to verify a number of complex and challenging programs, demonstrating that staged logic can be effectively automated. This automation is achieved via a novel proof search procedure and a method of lemma synthesis for reasoning about control operators.

[latest draft](/thesis.pdf)

[code](https://github.com/hipsleek/Heifer/)

[mechanisation](https://github.com/dariusf/staged)
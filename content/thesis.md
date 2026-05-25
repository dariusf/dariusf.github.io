---
title: PhD Thesis
---

# Automated Verification of Effectful Higher-order Programs

Higher-order functions and computational effects (such as mutable state, exceptions, and algebraic effects) are ubiquitous in real-world programs. However, verifying programs which use them together remains challenging: these features interact in ways that require nonlocal reasoning, necessitating handcrafted auxiliary specifications (such as invariants or protocols). This creates a conundrum, where automated verifiers provide only partial support or none at all, while interactive verifiers rely on semantic, manual approaches with no clear route to automation.

To address this, this dissertation introduces staged logic, a refinement-based approach to reasoning about effectful higher-order programs. Its central insight is that maintaining precision in specifications -- by internalising effects in the logic rather than relying on auxiliary specifications -- significantly simplifies proofs, which in turn enables automation via a syntactic proof search procedure. This is realised in Heifer, an automated SMT-based verifier for annotated OCaml programs, which has been evaluated on a range of challenging case studies. To validate its metatheory, two fragments of staged logic have also been mechanised in Rocq. Together, these efforts demonstrate that staged logic is a practical and effective foundation for the automated verification of effectful higher-order programs.

[Latest draft](/thesis.pdf) (updated 25 May 2026)

<!-- [Proposal slides](/darius-thesis-proposal-slides.pdf) -->

[Defence slides](/thesis-defence)

<!-- [Regex interpreter](https://github.com/dariusf/staged) -->

[Heifer](https://github.com/hipsleek/Heifer/)

[Mechanisation 1](https://github.com/dariusf/staged)

Mechanisation 2 (coming soon)

Lean version (coming soon)
---
title: "Satisfying Music Theory"
date: 2022-12-30
math: true
# toc: true
templateEngineOverride: md
---

<script src="./abcjs-basic-min.js"></script>
<link rel="stylesheet" type="text/css" href="./abcjs-audio.css">
<script src="./abcjs.js"></script>

<!-- TLDR -->

This post is about my experiments in generating music using SMT.

As a teaser, here is a procedurally-generated harmonization of the first line of <!-- the English Christmas carol -->
*Joy to the World*.
Given the melody (in the soprano voice), the system produces the other three voices in a way that makes harmonic sense.

<span id="joy">
X: 1
T: Joy to the World
L: 1/16
K: C
M: 4/4
Q: 1/4=110
V: sop name="S"
V: alto name="A"
V: tenor name="T" clef=treble-8
V: bass name="B" clef=bass middle=d transpose=-24
%
V: sop
c4 B3 A1 G6 F2 E4 D4 C6 G2 A6 A2 B6 B2 c6
V: alto
e4 d4 G6 d2 G6 G6 c6 F4 A2 e2 e1 e4 B1 c6
V: tenor
A4 D4 G6 A2 E1 E3 D4 E4 E6 A6 G4 G1 G3 A6
V: bass
"vi" A4 "V" G3 "ii" F1 "I" G6 "ii" A1 "iii" d1 "V" G6 "I" G6 "I" c6 "vi" d6 "ii" G2 "iii" B3 "iii" G3 "vi" A6
</span>
<script>renderMusicIn('joy')</script>

More examples [here](#examples). The rest of the post describes the journey (or at least the first part of it, since it appears to be far from over!).

# Procedural music composition

<!--
The dream of automatic composition
Composition as puzzle-solving
Motivation

The beauty of Renaissance polyphony is deeply intriguing to me.
-->

I've always found Renaissance polyphony deeply beautiful and intriguing. As an example, here is a performance of [Sicut Cervus](https://www.youtube.com/watch?v=Pdv9vmGo4EE), one of the hallmark pieces of the period.

<!-- {{< youtube Pdv9vmGo4EE >}} -->

Here is a [visualization](https://www.youtube.com/watch?v=0AgZuB9HuIc) of the piece which shows how the four voices move and interact. The voices have individual character, sometimes engage with each other, and all fit together to create cohesive harmony.

<!-- {{< youtube 0AgZuB9HuIc >}} -->

Here's another example, [Though Amaryllis Dance in Green](https://www.youtube.com/watch?v=VvK6awPV8VQ).

<!-- {{< youtube VvK6awPV8VQ >}} -->

<!-- what is this song about? -->

<!-- As an example. Amaryllis. Like a dance. Voices dancing. See how the lines cross and make up for each other and interact, and yet if you the individual lines they have a character of their own. The singer of each line has clear phrases -->

Check out the [visualization](http://youtube.com/watch?v=svvJrkfm5uI) (watch at 2x speed). As an [analysis](https://www.sonomabach.org/though-amaryllis---william-byrd.html) describes it,

<!-- {{< youtube svvJrkfm5uI >}} -->

<!--
<script>
  setTimeout(() => {
    let videos = document.querySelectorAll('video')
    videos[videos.length-1].playbackRate = 2;
  }, 1000)
</script>
-->

> What makes the piece special - and very fun to hear and to sing - is the liveliness of Byrd's setting. The five parts are extremely independent of each other, each filled with syncopations and leaps, like five dancers improvising, individually but in relation to each other. It makes me think of [this wonderful painting](https://www.invaluable.com/auction-lot/schomer-frank-lichtner-wisconsin-1905-2006-dancers-89-c-cf06fdea43) by Frank Schomer Lichtner.

<!--
Fugues are layered puzzles

1.75
[fair phyllis](https://www.youtube.com/watch?v=a-9XLm5ulHg)

1.75
[if ye love me](https://www.youtube.com/watch?v=Vc-NFZN_EjU)
[part 2](https://www.youtube.com/watch?v=RZ6DrEWjVnQ)
-->

How are such intricate pieces created? Can it be done systematically?

The simple approach of choosing chords first, then choosing notes which fit wouldn't result in independent voices.
Perhaps a nice, pleasing melody would work as a base, then the other voices could be written, ensuring they work with the harmony, which now emerges from the voices.
Presumably this would get harder and harder with each voice added, as new ideas would necessitate revisions of earlier voices to admit them and keep everything cohesive.
And this would be done iteratively until the piece is complete.
<!-- This whole process would be iterated to a fixed point. -->
<!-- And this is only the basic level, before creating the texture you want with all kinds of chords. -->

This sort of interleaved and iterative process of refinement might remind one of constraint propagation algorithms, and indeed, computer-aided composition using constraint solvers is its own subfield.
The "omnidirectional" nature of the solving process points to modelling the entire thing as a single constraint satisfaction problem [for more effective propagation](https://adamsmith.as/papers/fdg2013_shortcuts.pdf).

<!-- section 5.5 -->

<!--
Interdependent constraints
Not at all obvious where to start or what order to solve them in
-->

At this point I was curious to see how well a simple, baseline approach with an SMT solver would work.
Writing small prototypes is always fun, just to get a feel for the workflow and requirements, and if the idea would even work at all.
SMT solvers are a staple in my area of research, so how far could I get by simply writing some constraints in Python, solving them with Z3, then rendering the result?

This turned out to be *way* more of a rabbit hole than I anticipated.

# Vision
<!-- and applications -->

<!--
begin by stating assumptions on the
the type of musical tasks they aim to tackle,
Famous last words. My assumptions are in the next section.
-->

Many existing systems tackle specific musical tasks,
e.g. [generating rhythm](https://github.com/blapiere/Rhythm-Box), [automatic harmonization](http://musictech.mit.edu/sites/default/files/documents/pbchen_meng.pdf), [generating melody given a rhythm and chord progression](https://github.com/sprockeelsd/Melodizer), [generating a countermelody](https://dl.acm.org/doi/10.1145/3036290.3036295), etc.

What I hoped to build was something more general, more of a logical foundation for all these tasks. A follow-up goal would then be to build a [mixed-initiative](https://pure.york.ac.uk/portal/en/publications/mixed-initiative-creative-interfaces) composition tool on top of this foundation, perhaps even one accessible to [casual creators](https://computationalcreativity.net/iccc2015/proceedings/10_2Compton.pdf).

In particular, I was inspired by work on ASP-based procedural narrative generation, which encodes stories in logical form and searches for solutions to procedural generation tasks.
Section 6 of [this paper](https://adamsmith.as/papers/a17-chen.pdf) describes how in this very general setting, changing the amount of initial input leads to many modes of interaction with the system.
Specializing them to our musical use case:

1. *Tabula rasa* generation: using the background theory (e.g. harmony and melody constraints) to generate a piece from scratch
2. Constrained generation: finishing an incomplete piece; satisfying a melody (harmonization), chord progression, etc.
3. Generation based on a partial piece: starting with a piece that satisfies constraints (e.g. a well-known classic work), remove constraints to generate variations

There is a fourth use case which other systems in the typed music composition community highlight:

4. Validation: if the piece does not satisfy constraints, the violated constraints show mistakes in the piece or (more likely) inadequacies in our music theory

<!-- sight singing exercises -->

<!-- This led to the choice of encoding. -->

# Encoding

There are many possible logical encodings for musical scores and concepts, with different tradeoffs with respect to expressiveness and solver performance.
For example, a naive one would be to represent rhythm as a fixed grid of boolean variables, which would work for some kinds of music.
The [Strasheela thesis](https://strasheela.sourceforge.net/documents/TorstenAnders-PhDThesis.pdf) covers numerous encoding schemes, so I'll just go over my specific choices.

<!-- The encoding I settled on may seem simple, even naive, but the finding here is that with only limited understanding of how theory solvers work, a good heuristic for solver performance is to keep constraints dead simple. -->

Pitch is represented by bounded integer variables.

$$
\mathit{pitch}_p \equiv \{\, \rho_i \mid min_p \le \rho_i \le max_p,\, 0 \le i < n \,\},\, p \in \{\,S, A, T, B\,\}
$$

Rhythm is represented by duration variables.
Each note and chord has a duration, whose _start_ is represented as an offset from the beginning of the piece.
The first duration has value 0, the last is strictly smaller than the total duration of the piece, and the sequences of durations within a part are monotonically increasing.

$$
\mathit{rhythm}_p \equiv \{\, d_i \mid d_0 = 0,\, d_0 < d_1 < ... < d_n < d_t,\, 0 \le i < n \}
$$

Chords are treated the same way, with a duration and pitch (class).
Ties and measures are not represented and are treated as a rendering concern.

Whether a note is a rest is represented by a boolean variable, which causes the pitch value to be ignored iff it is true.

$$
\mathit{rests}_p \equiv \{\, r_i \mid 0 \le i < n \}
$$

Next, melody and harmony.

To apply melodic constraints, we must know if two notes are _consecutive_, and to apply harmonic constraints, we must know if a chord and note are _simultaneous_.
In a very general setting like ours,
this information may not yet be available, since it may be produced as a result of the search.

For example, we won't know if a chord and note are simultaneous if we have not yet determined their rhythm, which may in turn be affected by harmonic constraints, as a certain rhythm may not be allowed if it results in a dissonant chord.
This is called the _inaccessible score context problem_, from Section 6.3 of the [Strasheela thesis](https://strasheela.sourceforge.net/documents/TorstenAnders-PhDThesis.pdf).

The solution we use is logical implication, which this representation makes easy.
A chord and note are simultaneous if their duration variables overlap, and harmony constraints are applied if the simultaneous note is not a rest.

$$
simultaneous_{(n,c)} \equiv d_n < \mathit{end}(d_c) \wedge d_c < \mathit{end}(d_n)
$$

$$
harmony_{(n, c)} \equiv \neg r_c \wedge simultaneous_{(n,c)} \implies n \in \mathit{notes}(c)
$$

Two adjacent notes are consecutive if they are both not rests, and melody constraints are applied if notes are consecutive.

$$
consecutive_{(n_i,n_j)} \equiv \neg r_i \wedge \neg r_j
$$

$$
melody_{(n_i,n_j)} \equiv consecutive_{(n_i,n_j)} \implies \mathit{abs}(p_i - p_{i+1}) \in \mathit{intervals}
$$

To enforce harmony constraints, we need a list of allowed pitches given a chord; a _relation_ or _table constraint_ in constraint programming terms.
In typical SMT fashion, we unroll everything into a big disjunction instead.

# False starts

I tried several other approaches before settling on SMT.
My initial naive encodings with Z3 had disappointing performance.
I then tried extending [FaCiLe](http://facile.recherche.enac.fr/) with table constraints, but implementing propagators correctly is notoriously difficult and I experienced that firsthand.
Then I tried or-tools, which worked well until I encountered a [limitation](https://github.com/google/or-tools/discussions/3373) with reified constraints.
At this point I went back to Z3 and committed to finding an efficient encoding.

The takeaway: start with SMT. There probably is an efficient SMT encoding. If there isn't (and you have confirmed this!), you will likely have to look into a custom theory solver for your domain.

A few examples of subpar encodings:

- Use of modulo to handle octaves - unrolling is faster
- Use of a tuple of a pitch class and octave to model notes - bounded integers are faster
- Use of enumerations to model pitch - bounded integers are more flexible
- Unnecessary uses of if-then-else - just use disjunction
<!-- - Unnecessary uses of abs - just use disjunction! -->

Even with SMT, straying from the golden path and using newer SMTLIB features tends to lead to frustration, e.g. bugs and lacking support in solver APIs.

# Rust will find a way
<!-- # Implementation -->

My original Python implementation got unreasonably slow past a certain point.

```
$ ./run.sh examples/ode.py
music4.so not built, using Python implementation
Constraint (melody)             0.01s
Constraint (basics)             0.03s
Constraint (rhythm)             0.00s
Constraint (same ending rhythm) 0.00s
Constraint (no breathing)       0.00s
Constraint (no breathing)       0.00s
Constraint (no breathing)       0.00s
Constraint (simultaneity)       1.51s
Constraint (consonance)         23.50s
Constraint (melody intervals)   0.10s
Constraint (note durations)     0.04s
Constraint (chord durations)    0.02s
Solving                         59.69s
sat
Ode to Joy.musicxml
Ode to Joy.abc
```

It turns out that Z3's Python API [has significant overhead](https://stackoverflow.com/a/26385910).
I found other examples where just adding the constraints took 5s, but solving them was instant, evidenced by running Z3 on the generated SMTLIB file.

The usual move from here is to rewrite in Rust, so that's what I did. This significantly improved solving time...

```
$ ./run.sh examples/ode.py
Using music4.so
Constraints     446.5ms
Solving         15.1s
Sat
Ode to Joy.musicxml
Ode to Joy.abc
```

... at the cost of having to maintain a second, slightly-different implementation. I would have liked to retire the Python version, but there are reasons to keep it:

- It's significantly more accessible (i.e. why the Z3 Python API is so popular). Having to install a Rust toolchain and wait for Z3 to compile is not great for just trying out someone's code.
- It serves as a reference implementation for the much more verbose Rust version.

Maybe it could be used for differential testing someday...

<!--
For all of Rust's virtues, APIs in it aren't pretty. Rust is great for writing fast production code, but the compile time and annotation overhead may not be worth it for a small research project.

Rust does however have very nice Python interoperability with PyO3. At least if all you need is a Python interface to a compute-heavy Rust function which returns a big struct.
-->

# Examples

Now for some examples of generated pieces.
The constraints used for these may be found [here](https://github.com/dariusf/allez).
Feel free to tweak them and generate of your own pieces.

## Tabula rasa

In the absence of other constraints, all we have here is that intervals in consecutive notes have pleasing, familiar intervals.



## Countermelody

## Harmonization

<span id="ode">
X: 1
T: Ode to Joy
L: 1/16
K: C
M: 4/4
Q: 1/4=110
V: sop name="S"
V: alto name="A"
V: tenor name="T" clef=treble-8
V: bass name="B" clef=bass middle=d transpose=-24
%
V: sop
E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E6 D2 D8 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D6 C2 C8
V: alto
B8 A4 G8 D4 A,8 A,8 G,6 B,6 E2 B2 B2 A2 G2 A8 E2 F2 F2 G4 G2 G2 A8 D2 D2 C6 E2 B4 E4 A6 E2 C8
V: tenor
G8 d2 d2 g8 d4 A4 D2 A2 E2 A6 d2 G2 C2 G8 d4 a2 b2 a2 a8 d4 G8 A2 F2 C4 G4 c8 B8 A6 e2 e8
V: bass
"iii" G8 "ii" d8 "V" d8 "ii" A8 "vi" A8 "ii" B4 "vi" c2 "V" g8 "I" d4 "iii" a2 "V" d'4 "ii" c'8 "V" f4 "ii" g4 "vi" d4 "vi" A4 "ii" A2 "V" A2 "iii" d4 "V" c6 "ii" c2 "vi" G2 "V" d2 "vi" g2 "V" g2 "iii" d'2 "iii" d'2 "ii" d'2 "vi" c'2 "I" c'8
</span>
<script>renderMusicIn('ode')</script>

# Related work

<!-- I've not done much related work beyond the immediate questions I needed to get answered. This is my hobby project. Cannot delve into it with the same level of commitment. -->

The most closely related works are the constraint programming libraries [Strasheela (Oz)](https://github.com/tanders/strasheela) (which I took a lot of inspiration from) and [cluster-engine (Common Lisp)](https://github.com/tanders/cluster-engine). Others are [gecodeMCP (C++)](https://github.com/slemouton/gecodeMCP) and [OMClouds (Common Lisp)](https://github.com/openmusic-project/Clouds).

I have not yet tried most of them, but given their maturity I'm assuming they can handle all these benchmarks.
One salient difference is the language the user must write constraints in (annotated above).

Another is that the use of SMT allows _arbitrary_ constraints in standard theories (e.g. LIA) to be expressed.
With constraint solvers, the set of usable constraints is typically [large but limited](https://sofdem.github.io/gccat/) (no arbitrary disjunction!) and non-uniform across solvers, but solvable with more efficient specialized algorithms.
They may be more appropriate if the set of constraints required is well-understood (not the case yet, in this work).

Many of these libraries have been integrated into composition IDEs, such as 
[Opusmodus](https://opusmodus.com/), [OpenMusic](https://openmusic-project.github.io/), and [PWGL (seemingly defunct, links no longer work)](https://en.wikiversity.org/wiki/Music/Software/PWGL). [Rhythm-Box](https://github.com/blapiere/Rhythm-Box) and [Melodizer](https://www.info.ucl.ac.be/~pvr/SPROCKEELS_68641400_2022.pdf) (mentioned earlier) are components of OpenMusic.

Other systems this work was inspired by are [ANTON](https://arxiv.org/abs/1006.4948), which uses ASP for harmonization, [MusicTools](https://github.com/halfaya/MusicTools/blob/master/doc/farm22/abstract.pdf), an Agda library which also discharges musical synthesis via SMT, and [Type-Guided Music Composition](https://drive.google.com/file/d/18xE9Jmh2gq-KrIGmbKObxiFSWuoFqsi1/view), an approach which uses weighted refinement types to validate and synthesize music.

# Conclusion

This is very much early work.
Nevertheless, I'm publishing it to document my progress, get feedback, and allow others to play with the code.
I've spent way too long working on this in isolation.

Here are a few ideas for how this work could be brought forward.

The prototype is currently limited to a single key (C maj) and 6 diatonic chords.
Lifting these restrictions or improving the background theory (e.g. richer melody constraints, rhythmic constraints, more contrapunctal rules) would be great.
The potential of SMT solvers (optimization, soft constraints, unsat cores, alternative solvers) could be further exploited.
The system could be applied to more interesting musical puzzles, e.g. fugues, which would likely require new kinds of global constraints.

While it would be nice to integrate this into a composition IDE or build a new one for casual creators, I have no immediate plans to do so.
There are many [UX problems](http://erichorvitz.com/chi99horvitz.pdf) to be solved for a good UI design.
In particular, the UI should be cognizant of the limitations and potential of the use of SMT, and should provide the right affordances for creating music without requiring users to dive into the underlying theory.
The NP-hardness of SMT suggests that the UI should provide a means to localize solving.

The stability of produced outputs is another consideration: it is possible that the unconstrained parts of the piece could be entirely different between two solver calls. This would be a problem if users are working with the system in true mixed-initiative fashion, using its feedback to refine a synthesized piece.
[My previous work](https://github.com/srcclr/sapling) suffers from the same problem and utilized manual pinning of parts of the solution to mitigate this, but I'm sure there is a better way.

Code [here](https://github.com/dariusf/allez).
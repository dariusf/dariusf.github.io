---
title: "Satisfying Music Theory I"
date: 2022-12-30
math: true
# toc: true
templateEngineOverride: md
---

<script src="./abcjs-basic-min.js"></script>
<link rel="stylesheet" type="text/css" href="./abcjs-audio.css">
<script src="./abcjs-driver.js"></script>

<!-- TLDR -->

<span id="joy1">
%%staves vs va vt (vch vb)
X: 1
T: Joy to the World
L: 1/16
K: C
M: 4/4
Q: 1/4=100
V: vs name="S"
V: va name="A"
V: vt name="T"  clef=treble-8
V: vb name="B"  clef=bass middle=d transpose=-24
V: vch name=" "
%
V: vs
%%MIDI program 40
c4 B3 A1 G6 F2 | E4 D4 C6 G2 | A6 A2 B6 B2 | c6 c2 c2 B2 A2 G2 |
 G3 F1 E2 c2 c2 B2 A2 G2 | G3 F1 E2 E2 E2 E2 E2 E1 F1 | G6 G1 F1 D2 D2 D2 D1 E1 | F6 E1 D1 C2 c4 A2 |
 G3 F1 E2 F2 E4 D4 | C8 ||
V: va
%%MIDI program 41
e4 G3 e1 d6 A2 | e4 B4 e6 d2 | e6 e2 d6 d2 | e6 A2 f2 e2 c2 d2 |
 B3 F1 e2 e2 e2 d2 e2 d2 | d3 f1 e2 e2 e2 e2 e2 c1 f1 | d6 d1 f1 d2 d2 d2 d1 e1 | F6 e1 d1 e2 c4 e2 |
 d3 f1 e2 f2 e4 d4 | e8 ||
V: vt
%%MIDI program 42
c4 B3 C1 B6 c2 | c4 B4 c6 B2 | c6 c2 B6 B2 | c6 c2 c2 G2 c2 B2 |
 B3 c1 c2 c2 c2 B2 c2 B2 | B3 c1 c2 C2 c2 c2 c2 C1 c1 | B6 B1 c1 B2 B2 B2 B1 c1 | c6 c1 B1 c2 c4 c2 |
 B3 c1 c2 c2 c4 B4 | c8 ||
V: vb
%%MIDI program 42
e4 d3 e1 d6 c2 | e4 d4 e6 d2 | e6 e2 d6 d2 | e6 e2 c2 e2 e2 d2 |
 d3 c1 e2 e2 e2 d2 e2 d2 | G3 c1 e2 e2 e2 e2 e2 E1 c1 | d6 d1 c1 d2 d2 G2 d1 e1 | c6 e1 d1 e2 e4 e2 |
 d3 c1 e2 c2 e4 G4 | e8 ||
V: vch
"vi"x4 "V"x3 "vi"x1 "V"x6 "IV"x2 | "vi"x4 "V"x4 "vi"x6 "V"x2 | "vi"x6 "vi"x2 "V"x6 "V"x2 | "vi"x6 "vi"x2 "IV"x2 "iii"x2 "vi"x2 "V"x2 |
 "V"x3 "IV"x1 "vi"x2 "vi"x2 "vi"x2 "V"x2 "vi"x2 "V"x2 | "V"x3 "IV"x1 "vi"x2 "vi"x2 "vi"x2 "vi"x2 "vi"x2 "I"x1 "IV"x1 | "V"x6 "V"x1 "IV"x1 "V"x2 "V"x2 "V"x2 "V"x1 "vi"x1 | "IV"x6 "vi"x1 "V"x1 "vi"x2 "vi"x4 "vi"x2 |
 "V"x3 "IV"x1 "vi"x2 "IV"x2 "vi"x4 "V"x4 | "vi"x8 ||
</span>
<script>
// renderMusicIn('joy1', {viewportHorizontal: false, scrollHorizontal: true});
renderMusicIn('joy1');
// renderMusicIn('joy1', { wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 10 } });
for (const v of [1, 2, 3, 4]) {
  for (const e of document.querySelectorAll(`#joy1 .abcjs-v${v}.abcjs-note`)) {
    e.classList.add('generated');
  }
}
for (const e of document.querySelectorAll(`#joy1 .abcjs-chord`)) {
  e.classList.add('generated');
}
</script>

Reharmonization of Joy to the World. The melody is given and the other voices are subject to basic homophonic harmony constraints.

<span id="joy2">
%%staves vs va vt (vch vb)
X: 1
T: Joy to the World
L: 1/16
K: C
M: 4/4
Q: 1/4=100
V: vs name="S"
V: va name="A"
V: vt name="T"  clef=treble-8
V: vb name="B"  clef=bass middle=d transpose=-24
V: vch name=" "
%
V: vs
%%MIDI program 40
c4 B3 A1 G6 F2 | E4 D4 C6 G2 | A6 A2 B6 B2 | c6 c2 c2 B2 A2 G2 |
 G3 F1 E2 c2 c2 B2 A2 G2 | G3 F1 E2 E2 E2 E2 E2 E1 F1 | G6 G1 F1 D2 D2 D2 D1 E1 | F6 E1 D1 C2 c4 A2 |
 G3 F1 E2 F2 E4 D4 | C8 ||
V: va
%%MIDI program 41
G1 G1 F2 e6 (cc6 | cc2)  c1 G6 G6 (cc1 | cc4-c2-c1)  A1 B8 | G1 G4 G1 G2 c2 e2 A2 B2 |
 B1 G1 d1 A1 G8 F1 F1 (GG2 | GG1)  c2 F1 A1 e1 G1 e1 G1 e3 G1 G1 c1 (cc1 | cc2)  G3 d8 d1 d1 G1 | A4 F1 f1 c1 G1 A8 |
 G2 G1 f1 A8 G1 d3 | e8 ||
V: vt
%%MIDI program 42
C4 E4 G1 (CC4-C2-C1 | CC1)  c2 G8 E4 (cc1 | cc4-c2-c1)  F1 B1 G6 G1 | E2 E4 C1 E1 C1 C1 B1 G1 C1 E2 (GG1 | GG3)
 A1 G8 A2 c1 (EE1 | EE3)  F1 C1 C1 C1 E1 C1 C1 C1 E1 B1 E1 (cc2 | cc4)  D8 G2 G1 (CC1 | CC2)  C3 C1 G2 F1 A2 A2 C3 |
 C3 A1 C6 A2 D4 | c8 ||
V: vb
%%MIDI program 42
e1 c1 F2 E4 G4 (cc4 | cc4)  d4 c8 | c6 c1 F1 B2 G4 (GG2 | GG6)  E4 G2 c1 E1 (EE2 | EE1)
 d3 E3 E3 E1 E1 F1 F1 (ee2 | ee2)  G1 d1 c2 E2 E3 E2 B1 c2 | c2 G1 G3 d2 d4 G1 G1 G1 (cc1 | cc4-c2-c1)  d1 F1 A1 F1 F1 F1 F1 F2 |
 c8 E4 G2 G2 | e8 ||
V: vch
"I"x1 "I"x1 "IV"x2 "iii"x3 "vi"x1 "I"x6 "IV"x1 "IV"x1 | "I"x4 "V"x4 "I"x8 | "IV"x8 "V"x8 | "I"x6 "I"x4 "iii"x2 "IV"x1 "vi"x1 "iii"x1 "iii"x1 |
 "iii"x1 "V"x2 "ii"x1 "I"x6 "iii"x2 "ii"x2 "I"x2 | "I"x2 "I"x1 "ii"x1 "vi"x1 "vi"x1 "I"x4 "I"x2 "iii"x2 "I"x1 "IV"x1 | "I"x3 "I"x1 "V"x3 "ii"x1 "ii"x4 "V"x2 "V"x1 "I"x1 | "IV"x6 "I"x1 "V"x1 "IV"x4 "IV"x4 |
 "I"x3 "IV"x1 "vi"x2 "IV"x2 "vi"x3 "vi"x1 "V"x4 | "vi"x8 ||
</span>
<script>
// renderMusicIn('joy2', {viewportHorizontal: false, scrollHorizontal: true});
renderMusicIn('joy2');
// renderMusicIn('joy2', { wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 10 } });
for (const v of [1, 2, 3, 4]) {
  for (const e of document.querySelectorAll(`#joy2 .abcjs-v${v}.abcjs-note`)) {
    e.classList.add('generated');
  }
}
for (const e of document.querySelectorAll(`#joy2 .abcjs-chord`)) {
  e.classList.add('generated');
}
</script>

Same as above, but without the homophonic constraint. Now the voices can move freely and independently, as long as they stick within any harmony constraints induced by the melody line.

<span id="counterpoint1">
%%staves vs (vch va)
X: 1
T: Counterpoint
L: 1/4
K: C
M: 4/4
Q: 1/4=60
V: vs name="S"
V: va name="A"
V: vch name=" "
%
V: vs
%%MIDI program 52
e1 g1 e1 d1 | c1 B1 c1 e1 | d1 c1 d1 e1 | f1 e1 ||
V: va
%%MIDI program 52
e1 e1 a1 g1 | c'1 g1 g1 a1 | g1 c'1 g1 g1 | c1 e1 ||
V: vch
"vi"x1 "iii"x1 "vi"x1 "V"x1 | "I"x1 "iii"x1 "I"x1 "vi"x1 | "V"x1 "I"x1 "V"x1 "I"x1 | "IV"x1 "vi"x1 ||
</span>
<script>
// renderMusicIn('counterpoint1', {viewportHorizontal: false, scrollHorizontal: true});
renderMusicIn('counterpoint1');
// {wrap:{ minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 }}
for (const v of [1, 2]) {
  for (const e of document.querySelectorAll(`#counterpoint1 .abcjs-v${v}.abcjs-note`)) {
    e.classList.add('generated');
  }
}
for (const e of document.querySelectorAll(`#counterpoint1 .abcjs-chord`)) {
  e.classList.add('generated');
}
</script>

<span id="counterpoint2">
%%staves vs (vch va)
X: 1
T: Counterpoint 2
L: 1/4
K: C
M: 4/4
Q: 1/4=60
V: vs name="S"
V: va name="A"
V: vch name=" "
%
V: vs
%%MIDI program 52
g1 e1 f1 e1 | d1 f1 g1 e1 | a1 g1 ||
V: va
%%MIDI program 52
g1 g1 c'1 g1 | g1 d1 c1 g1 | c1 g1 ||
V: vch
"iii"x1 "I"x1 "IV"x1 "iii"x1 | "V"x1 "ii"x1 "I"x1 "iii"x1 | "vi"x1 "I"x1 ||
</span>
<script>
// renderMusicIn('counterpoint2', {viewportHorizontal: false, scrollHorizontal: true});
renderMusicIn('counterpoint2');
// {wrap:{ minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 }}
for (const v of [1, 2]) {
  for (const e of document.querySelectorAll(`#counterpoint2 .abcjs-v${v}.abcjs-note`)) {
    e.classList.add('generated');
  }
}
for (const e of document.querySelectorAll(`#counterpoint2 .abcjs-chord`)) {
  e.classList.add('generated');
}
</script>

Two example exercises, following most of the rules of [First Species Counterpoint](https://musictheory.pugetsound.edu/mt21c/FirstSpecies.html),
as well as [general rules for melody](https://musictheory.pugetsound.edu/mt21c/RulesOfMelody.html).

<span id="ode1">
%%staves vs va vt (vch vb)
X: 1
T: Ode to Joy
L: 1/8
K: C
M: 4/4
Q: 1/4=100
V: vs name="S"
V: va name="A"
V: vt name="T"  clef=treble-8
V: vb name="B"  clef=bass middle=d transpose=-24
V: vch name=" "
%
V: vs
%%MIDI program 20
e2 e2 f2 g2 | g2 f2 e2 d2 | c2 c2 d2 e2 | e3 d1 d4 |
 e2 e2 f2 g2 | g2 f2 e2 d2 | c2 c2 d2 e2 | d3 c1 c4 |
 d2 d2 e2 c2 | d2 e1 f1 e2 c2 | d2 e1 f1 e2 d2 | c2 d2 G4 |
 e2 e2 f2 g2 | g2 f2 e2 d2 | c2 c2 d2 e2 | d3 c1 (cc4 | cc8)
 ||
V: va
%%MIDI program 20
c2 e2 f2 d2 | B2 A2 A2 d2 | e2 e2 d2 e2 | e3 d1 G4 |
 e2 e2 A2 G2 | d2 f2 e2 d2 | e2 e2 d2 e2 | d3 e1 A4 |
 B2 G2 e2 e2 | d2 e1 f1 e2 e2 | d2 e1 f1 e2 d2 | e2 G2 B4 |
 c2 e2 f2 d2 | d2 f2 e2 d2 | e2 e2 d2 A2 | d3 e1 (ee4 | ee8)
 ||
V: vt
%%MIDI program 20
c2 c2 F2 B2 | B2 A2 C2 B2 | c2 c2 B2 c2 | c3 B1 B4 |
 c2 C2 c2 B2 | B2 c2 c2 B2 | c2 c2 B2 c2 | B3 c1 c4 |
 B2 B2 c2 c2 | B2 c1 c1 c2 c2 | B2 c1 c1 B2 D2 | c2 B2 B4 |
 c2 C2 c2 B2 | B2 c2 c2 B2 | c2 c2 B2 c2 | B3 c1 (cc4 | cc8)
 ||
V: vb
%%MIDI program 20
e2 e2 c2 d2 | d2 A2 E2 d2 | e2 e2 d2 e2 | e3 G1 d4 |
 e2 e2 c2 d2 | d2 c2 e2 d2 | e2 e2 d2 e2 | G3 e1 e4 |
 d2 d2 e2 e2 | d2 e1 c1 e2 e2 | d2 e1 c1 e2 d2 | e2 d2 d4 |
 e2 E2 c2 d2 | d2 c2 e2 d2 | e2 e2 d2 e2 | d3 e1 (ee4 | ee8)
 ||
V: vch
"vi"x2 "vi"x2 "IV"x2 "V"x2 | "V"x2 "ii"x2 "vi"x2 "V"x2 | "vi"x2 "vi"x2 "V"x2 "vi"x2 | "vi"x3 "V"x1 "V"x4 |
 "vi"x2 "vi"x2 "IV"x2 "V"x2 | "V"x2 "IV"x2 "vi"x2 "V"x2 | "vi"x2 "vi"x2 "V"x2 "vi"x2 | "V"x3 "vi"x1 "vi"x4 |
 "V"x2 "V"x2 "vi"x2 "vi"x2 | "V"x2 "vi"x1 "IV"x1 "vi"x2 "vi"x2 | "V"x2 "vi"x1 "IV"x1 "iii"x2 "V"x2 | "vi"x2 "V"x2 "V"x4 |
 "vi"x2 "I"x2 "IV"x2 "V"x2 | "V"x2 "IV"x2 "vi"x2 "V"x2 | "vi"x2 "vi"x2 "V"x2 "vi"x2 | "V"x3 "vi"x1 "vi"x4 | "vi"x8
 ||
</span>
<script>
// renderMusicIn('ode1', {viewportHorizontal: false, scrollHorizontal: true});
renderMusicIn('ode1');
// {wrap:{ minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 }}
for (const v of [1, 2, 3, 4]) {
  for (const e of document.querySelectorAll(`#ode1 .abcjs-v${v}.abcjs-note`)) {
    e.classList.add('generated');
  }
}
for (const e of document.querySelectorAll(`#ode1 .abcjs-chord`)) {
  e.classList.add('generated');
}
</script>

Reharmonization of Ode to Joy. Same constraints and setup as the homophonic Joy to the World.

<span id="ode2">
%%staves vs va vt (vch vb)
X: 1
T: Ode to Joy
L: 1/8
K: C
M: 4/4
Q: 1/4=100
V: vs name="S"
V: va name="A"
V: vt name="T"  clef=treble-8
V: vb name="B"  clef=bass middle=d transpose=-24
V: vch name=" "
%
V: vs
%%MIDI program 20
e2 e2 f2 g2 | g2 f2 e2 d2 | c2 c2 d2 e2 | e3 d1 d4 |
 e2 e2 f2 g2 | g2 f2 e2 d2 | c2 c2 d2 e2 | d3 c1 c4 |
 d2 d2 e2 c2 | d2 e1 f1 e2 c2 | d2 e1 f1 e2 d2 | c2 d2 G4 |
 e2 e2 f2 g2 | g2 f2 e2 d2 | c2 c2 d2 e2 | d3 c1 (cc4 | cc8)
 ||
V: va
%%MIDI program 20
c4-c2-c1 (dd1 | dd2)  F1 F1 c2 G1 f1 | F1 f1 F1 c1 G2 (GG2 | GG3)  d1 G1 G1 G1 G1 |
 A4-A1 F1 c1 (cc1 | cc2)  F2 e2 d2 | F4 d1 (AA3 | AA3)  A1 F1 c3 |
 F4 e4 | d2 e1 A1 G2 f1 F1 | G1 G2 f1 A3 f1 | F1 F1 A1 d1 B2 (GG2 | GG1)
 G1 B1 B1 (cc4 | cc2)  f1 (AA4-A1 | AA2)  G1 e1 G2 (GG2 | GG3)  A1 (ee4 | ee8)
 ||
V: vt
%%MIDI program 20
C3 C4 D1 | G2 C1 F1 C1 C1 D2 | F4 D1 D1 (CC2 | CC3)  D1 B4 |
 A4-A1 F1 E1 c1 | G1 G1 D1 D1 (AA4 | AA4)  D1 A3 | D2 A1 c1 C1 F1 c1 c1 |
 A4-A1 E1 E2 | G3 A1 C4 | D2 E1 A1 c1 c1 D2 | c1 c1 A2 B1 E1 B1 B1 |
 E4 c1 (CC3 | CC2)  (AA6 | AA2)  C2 G4 | B3 c1 c1 (cc3 | cc8)
 ||
V: vb
%%MIDI program 20
A3 E1 F1 F1 c1 (dd1 | dd2)  F1 d1 E2 d1 F1 | A4 B2 (GG2 | GG4)  B3 G1 |
 (cc8 | cc2)  F2 A1 E1 (FF2 | FF1)  F1 A1 F1 G1 d1 E2 | d3 (AA4-A1 | AA6)
 A1 A1 | G1 B1 E1 F1 E1 E1 F1 A1 | B2 e1 F1 (AA4 | AA4)  (BB4 | BB1)
 e1 G1 B1 A2 G1 G1 | c1 E1 A4 F1 d1 | e2 (GG6 | GG3)  e1 E1 e1 e1 (ee1 | ee8)
 ||
V: vch
"vi"x4 "IV"x2 "I"x1 "V"x1 | "V"x1 "V"x1 "IV"x1 "ii"x1 "I"x2 "V"x1 "ii"x1 | "IV"x4 "V"x2 "I"x2 | "I"x3 "V"x1 "V"x4 |
 "vi"x4 "IV"x1 "IV"x1 "I"x2 | "I"x2 "ii"x2 "vi"x1 "vi"x1 "ii"x2 | "IV"x4 "V"x1 "ii"x1 "vi"x2 | "ii"x3 "IV"x5 |
 "ii"x3 "ii"x1 "vi"x1 "vi"x3 | "V"x2 "I"x1 "ii"x1 "I"x2 "IV"x1 "IV"x1 | "V"x2 "iii"x1 "ii"x1 "vi"x2 "ii"x2 | "IV"x2 "ii"x1 "ii"x1 "iii"x4 | "iii"x4
 "IV"x2 "I"x2 | "I"x2 "ii"x2 "vi"x1 "vi"x1 "ii"x1 "ii"x1 | "vi"x2 "I"x2 "V"x2 "iii"x2 | "V"x2 "V"x1 "vi"x5 | "vi"x8
 ||
</span>
<script>
// renderMusicIn('ode2', {viewportHorizontal: false, scrollHorizontal: true});
renderMusicIn('ode2');
// {wrap:{ minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 }}
for (const v of [1, 2, 3, 4]) {
  for (const e of document.querySelectorAll(`#ode2 .abcjs-v${v}.abcjs-note`)) {
    e.classList.add('generated');
  }
}
for (const e of document.querySelectorAll(`#ode2 .abcjs-chord`)) {
  e.classList.add('generated');
}
</script>


<span id="jingle">
%%staves vs va vt (vch vb)
X: 1
T: Jingle Bells
L: 1/16
K: C
M: 4/4
Q: 1/4=120
V: vs name="S"
V: va name="A"
V: vt name="T"  clef=treble-8
V: vb name="B"  clef=bass middle=d transpose=-24
V: vch name=" "
%
V: vs
%%MIDI program 53
G2 e2 d2 c2 G6 G1 G1 | G2 e2 d2 c2 A8 | A2 f2 e2 d2 B6 g2 | a2 g2 f2 d2 e8 |
 G2 e2 d2 c2 G6 G1 G1 | G2 e2 d2 c2 A6 A2 | A2 f2 e2 d2 g2 g2 g2 g2 | a2 g2 f2 d2 c8 |
 e2 e2 e4 e2 e2 e4 | e2 g2 c3 d1 e8 | f2 f2 f3 f1 f2 e2 e2 e1 e1 | e2 d2 d2 e2 d4 g4 |
 e2 e2 e4 e2 e2 e4 | e2 g2 c3 d1 e8 | f2 f2 f3 f1 f2 e2 e2 e1 e1 | g2 g2 f2 d2 c8 |
 ||
V: va
%%MIDI program 53
G2 c2 A2 A2 d'6 d'1 d'1 | B2 A2 d'2 e'2 e'8 | e'2 f'2 c'2 d'2 b6 d'2 | e'2 g2 f'2 G2 e'8 |
 e'2 e'2 d'2 e'2 d'6 d1 G1 | G2 a2 d'2 A2 e'6 c'2 | F2 f'2 e'2 d'2 d'2 d'2 d'2 e'2 | c'2 d'2 f'2 d'2 e'8 |
 e'2 e'2 e'4 e'2 e'2 e'4 | e'2 b2 e3 d'1 e'8 | A2 f'2 f'3 f1 f'2 e'2 e'2 e'1 e'1 | e'2 G2 d'2 e'2 B4 d'4 |
 e'2 A2 g4 G2 e'2 e'4 | e'2 d'2 e'3 f'1 c8 | a2 f'2 a3 F1 f'2 c'2 e'2 e'1 e'1 | d'2 d'2 f'2 d'2 e'8 |
 ||
V: vt
%%MIDI program 53
b2 c'2 A2 c'2 G6 b1 b1 | b2 c'2 b2 c'2 c'8 | c'2 c'2 C2 b2 b6 b2 | c'2 b2 c'2 b2 c'8 |
 b2 c'2 b2 c'2 b6 b1 b1 | b2 E2 b2 c'2 c'6 c'2 | A2 c'2 c'2 b2 b2 b2 b2 b2 | c'2 b2 c'2 b2 c'8 |
 c'2 c'2 c'4 c'2 c'2 c'4 | c'2 b2 c'3 b1 c'8 | f2 c'2 c'3 c'1 c'2 c'2 c'2 c'1 c'1 | c'2 b2 b2 G2 b4 B4 |
 c'2 c'2 C4 b2 c'2 c'4 | c'2 b2 c'3 A1 c'8 | c'2 c'2 a3 c'1 c'2 c'2 c'2 c'1 c'1 | b2 b2 c'2 b2 c'8 |
 ||
V: vb
%%MIDI program 53
d'2 e'2 A2 e'2 d'6 d'1 d'1 | d'2 e'2 d'2 e'2 e'8 | e'2 c'2 E2 d'2 e'6 d'2 | e'2 d'2 c'2 d'2 e'8 |
 e'2 e'2 d'2 e'2 b6 d'1 e'1 | d'2 e'2 d'2 e'2 e'6 e'2 | A2 c'2 e'2 d'2 d'2 b2 d'2 e'2 | c'2 d'2 c'2 d'2 e'8 |
 e'2 e'2 e'4 e'2 e'2 e'4 | e'2 d'2 e'3 d'1 e'8 | A2 c'2 c'3 c'1 c'2 e'2 e'2 e'1 e'1 | e'2 d'2 d'2 E2 d'4 d'4 |
 e'2 e'2 e'4 E2 e'2 e'4 | e'2 d'2 e'3 A1 e'8 | c'2 c'2 A3 c'1 c'2 e'2 e'2 e'1 e'1 | d'2 d'2 c'2 d'2 e'8 |
 ||
V: vch
"V"x2 "vi"x2 "ii"x2 "vi"x2 "V"x6 "V"x1 "V"x1 | "V"x2 "vi"x2 "V"x2 "vi"x2 "vi"x8 | "vi"x2 "IV"x2 "I"x2 "V"x2 "iii"x6 "V"x2 | "vi"x2 "V"x2 "IV"x2 "V"x2 "vi"x8 |
 "iii"x2 "vi"x2 "V"x2 "vi"x2 "V"x6 "V"x1 "iii"x1 | "V"x2 "vi"x2 "V"x2 "vi"x2 "vi"x6 "vi"x2 | "ii"x2 "IV"x2 "vi"x2 "V"x2 "V"x2 "V"x2 "V"x2 "iii"x2 | "IV"x2 "V"x2 "IV"x2 "V"x2 "vi"x8 |
 "vi"x2 "vi"x2 "vi"x4 "vi"x2 "vi"x2 "vi"x4 | "vi"x2 "V"x2 "vi"x3 "V"x1 "vi"x8 | "ii"x2 "IV"x2 "IV"x3 "IV"x1 "IV"x2 "vi"x2 "vi"x2 "vi"x1 "vi"x1 | "vi"x2 "V"x2 "V"x2 "I"x2 "V"x4 "V"x4 |
 "vi"x2 "vi"x2 "I"x4 "iii"x2 "vi"x2 "vi"x4 | "vi"x2 "V"x2 "vi"x3 "ii"x1 "vi"x8 | "IV"x2 "IV"x2 "ii"x3 "IV"x1 "IV"x2 "vi"x2 "vi"x2 "vi"x1 "vi"x1 | "V"x2 "V"x2 "IV"x2 "V"x2 "vi"x8 |
 ||
</span>
<script>
// renderMusicIn('jingle', {viewportHorizontal: false, scrollHorizontal: true});
renderMusicIn('jingle');
// {wrap:{ minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 }}
for (const v of [1, 2, 3, 4]) {
  for (const e of document.querySelectorAll(`#jingle .abcjs-v${v}.abcjs-note`)) {
    e.classList.add('generated');
  }
}
for (const e of document.querySelectorAll(`#jingle .abcjs-chord`)) {
  e.classList.add('generated');
}
</script>

Jingle Bells. Fewer constraints to start with, so the middle voices can do crazier things.

<span id="jingle1">
%%staves vs va vt (vch vb)
X: 1
T: Jingle Bells
L: 1/16
K: C
M: 4/4
Q: 1/4=120
V: vs name="S"
V: va name="A"
V: vt name="T"  clef=treble-8
V: vb name="B"  clef=bass middle=d transpose=-24
V: vch name=" "
%
V: vs
%%MIDI program 53
G2 e2 d2 c2 G6 G1 G1 | G2 e2 d2 c2 A8 | A2 f2 e2 d2 B6 g2 | a2 g2 f2 d2 e8 |
 G2 e2 d2 c2 G6 G1 G1 | G2 e2 d2 c2 A6 A2 | A2 f2 e2 d2 g2 g2 g2 g2 | a2 g2 f2 d2 c8 |
 e2 e2 e4 e2 e2 e4 | e2 g2 c3 d1 e8 | f2 f2 f3 f1 f2 e2 e2 e1 e1 | e2 d2 d2 e2 d4 g4 |
 e2 e2 e4 e2 e2 e4 | e2 g2 c3 d1 e8 | f2 f2 f3 f1 f2 e2 e2 e1 e1 | g2 g2 f2 d2 c8 |
 ||
V: va
%%MIDI program 53
b4 a3 e'1 (cc8 | cc4)  d2 f6 d'1 A1 F1 F1 | F1 F1 F1 d'1 A1 B8-B2-B1 | A2 e1 e'1 F4 e4-e1 (bb3 | bb4)
 d2 c2 G1 G2 G1 G2 e'2 | G1 g1 G1 e'1 g1 B1 e'1 c'1 f'1 f'1 c'1 (ff4-f1 | ff4)  G8 (dd4 | dd4)  d4 c'8 |
 e3 e'1 A1 c'1 c'1 c'1 A1 e'1 A1 e'1 (e'e'4 | e'e'2)  g1 e'1 A1 c2 g1 e1 c'1 c'1 g4 e1 | f'8-f'2 e'1 a1 (c'c'4 | c'c'2)  d'1 b1 d'1 a3 d'8 |
 c'8-c'2-c'1 c1 e'1 A1 e1 (ee1 | ee4)  A1 e'1 c'1 G1 c'1 e'3 e'1 A1 e1 a1 | c'8-c'4-c'1 G1 (ee2 | ee1)  e'2 g1 f'1 F1 d2 c8 |
 ||
V: vt
%%MIDI program 53
g4 a3 (gg8-g1 | gg4)  a2 a1 c'1 c'1 c'1 c'1 A1 (aa4 | aa1)  a1 f1 D1 e2 D1 B1 B8 | A1 A1 G2 a1 D1 a2 C4-C1 (bb3 | bb4-b1)
 b1 C8 E2 | b1 b1 G1 E1 b1 b1 g1 c'1 (FF8 | FF4)  c'1 c'1 B1 G4-G1 D1 D1 b1 D1 | D4 F4 C1 c'1 F1 C4-C1 |
 e2 A8-A1 (CC4-C1 | CC1)  A1 c'2 f1 e1 c'1 b2 c'1 E1 E3 c'2 | d8-d2 e1 A4-A1 | E1 E1 D4 c'2 b8 |
 c'1 c'1 c'1 c'1 c'1 A1 c'1 c'1 c'1 c'4-c'2-c'1 | c'4-c'2-c'1 b1 (c'c'8 | c'c'1)  c'1 c1 a1 C1 c'1 c'1 C1 A1 c'3 (ee4 | ee3)  C2 D1 b2 c'8 |
 ||
V: vb
%%MIDI program 53
G4 a3 c'1 (c'c'8 | c'c'1)  c'1 c'1 c'1 A2 c'3 c'1 (ff6 | ff1)  a1 c'1 A1 e1 b8-b2-b1 | f1 f1 e2 F4 e1 e'1 A1 c1 c1 (BB3 | BB6)
 c6 G2 e1 E1 | E1 B4 B1 E2 f1 F1 f3 (dd3 | dd3)  F1 E1 E1 g6 (dd4 | dd2)  G1 G1 F1 d'3 c4-c2-c1 c1 |
 E12 E1 E1 E1 e'1 | e1 A1 E2 F1 E1 E1 g1 E1 e'1 c'1 G4 E1 | a8-a2-a1 e1 e'1 (e'e'3 | e'e'2)  G3 d'1 e2 G8 |
 e'12 e'1 e'2 e'1 | e'1 e'1 e'1 e'2 e'1 e'1 G1 c'4-c'2-c'1 c'1 | c'1 c'4-c'2-c'1 c'1 c'2 E1 c'1 E1 c'2 | E4 F1 F1 G2 c'8 |
 ||
V: vch
"V"x1 "iii"x3 "ii"x1 "ii"x1 "vi"x1 "I"x1 "I"x8 | "I"x3 "I"x1 "ii"x2 "IV"x5 "IV"x1 "ii"x4 | "ii"x1 "IV"x2 "ii"x1 "vi"x1 "iii"x1 "V"x10 | "ii"x2 "I"x2 "ii"x4 "vi"x5 "iii"x3 | "iii"x4
 "V"x2 "IV"x1 "vi"x1 "I"x2 "I"x1 "I"x3 "iii"x2 | "iii"x4 "V"x2 "I"x2 "ii"x2 "IV"x1 "ii"x1 "ii"x1 "ii"x1 "ii"x2 | "ii"x4 "I"x2 "V"x2 "I"x2 "V"x1 "I"x1 "V"x4 | "ii"x2 "V"x2 "ii"x4 "IV"x3 "IV"x1 "IV"x4 |
 "iii"x1 "vi"x1 "vi"x1 "vi"x8 "vi"x1 "vi"x4 | "vi"x1 "vi"x1 "I"x1 "I"x1 "IV"x1 "I"x1 "I"x1 "V"x1 "iii"x1 "vi"x2 "iii"x1 "I"x1 "I"x1 "I"x2 | "ii"x10 "vi"x6 | "vi"x2 "V"x3 "ii"x1 "vi"x2 "V"x8 |
 "vi"x2 "vi"x8 "I"x1 "I"x1 "vi"x3 "I"x1 | "I"x4 "vi"x1 "vi"x1 "vi"x1 "V"x1 "vi"x8 | "IV"x9 "IV"x1 "vi"x1 "I"x2 "iii"x1 "vi"x1 "I"x1 | "I"x1 "I"x1 "iii"x1 "I"x1 "IV"x1 "ii"x1 "V"x2 "vi"x8 |
 ||
</span>
<script>
// renderMusicIn('jingle1', {viewportHorizontal: false, scrollHorizontal: true});
renderMusicIn('jingle1');
// {wrap:{ minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 }}
for (const v of [1, 2, 3, 4]) {
  for (const e of document.querySelectorAll(`#jingle1 .abcjs-v${v}.abcjs-note`)) {
    e.classList.add('generated');
  }
}
for (const e of document.querySelectorAll(`#jingle1 .abcjs-chord`)) {
  e.classList.add('generated');
}
</script>


Without homophonic constraints.

---

Some notes on my experiments in generating music using SMT.

As a teaser, here is a procedurally-generated harmonization of the first line of <!-- the English Christmas carol -->
*Joy to the World*.
Given the melody (in the soprano voice), the system produces the other three voices (drawn <span class='generated'>faded</span>) in a way that makes harmonic sense.

<style>
  .generated {
    color:rgb(162, 162, 162)
  }
</style>

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
<script>
renderMusicIn('joy');
for (const v of [1, 2, 3]) {
  for (const e of document.querySelectorAll(`#joy .abcjs-v${v}.abcjs-note`)) {
    e.classList.add('generated');
  }
}
</script>

(If you are on iOS and can't hear any audio, disable silent mode)

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
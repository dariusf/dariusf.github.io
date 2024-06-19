---
layout: post
title: "Jump-to-definition in PL papers"
date: 2023-08-01 14:17:22 +0800
---

PL papers tend to use lots of [notation](https://www.jsoftware.com/papers/tot.htm).
To manage this, paper sources usually include a "macros.tex" containing a slew of `\newcommand`s, defining wonderful languages of terms and naming all the clever judgments and syntactic sugar.

While notation can increase clarity, it can cause [difficulty](https://blog.sigplan.org/2020/09/29/pl-notation-is-a-barrier-to-entry/) to readers, who
haven't had the hundreds of hours of practice the authors have had using and reading those intricate strings of symbols, and internalizing their precedences and meaning.
Readers will forget what things denote and will have to scroll up and down repeatedly in a careful reading of the work.

In an attempt to alleviate this and make my work more accessible, I've been using a small set of macros to enable jump-to-definition for the important (or obscure) symbols:


<!-- \usepackage[hidelinks]{hyperref} also works -->

```latex
% somewhere above
\usepackage[colorlinks=true]{hyperref}

% meta-commands for defining notation
\newcommand\notationlink[2]{\hyperlink{#1}{\normalcolor #2}}
\newcommand\notationtarget[2]{{\hypertarget{#1}{}}#2}
\newcommand*{\notation}[2]{%
  \expandafter\newcommand\csname #1\endcsname{\notationlink{#1}{#2}}%
  \expandafter\newcommand\csname #1Def\endcsname{\notationtarget{#1}{}}}
```

The idea is essentially to link uses of notation to their definitions. All that's really needed for that is to pepper `\hyperlink` and `\hypertarget` everywhere, and this is what people [already do](https://damaru2.github.io/general/notations_with_links/).

We can be a little more structured. First, for macros.tex enjoyers, we'll use the command `\notation` to define a new symbol, so all the definitions can go in one place. For example,

```latex
\notation{trace}{\tau}
```

This defines the command `\trace` as a macro for `\tau`.
More importantly, it defines the paired command `\traceDef`, which is used to mark the definition site of this symbol, and which every occurrence of `\trace` unobtrusively links to.

For example, having written this,

```latex
A \emph{trace} $\trace$ is a sequence of states...
```

simply include `\traceDef` nearby:

```latex
A \traceDef\emph{trace} $\trace$ is a sequence of states...
```

Subsequent uses of `\trace` (even the one right after) will now contain links back to this part of the paper.

Doing this has benefits for authors too.
The introduction of a new concept is now made explicit, which may help you consider if you're doing a "forward definition";
if you forget the definition, you get a compilation warning.
Furthermore, paired with SyncTex, you can really zip around the paper.

For an example of this in action, I've annotated my most recent paper [here](https://arxiv.org/abs/2308.00988).

The amount of effort was very low for the value &ndash; it's very much pay-as-you-go, and easy to do while proofreading.
To prioritize, focus on important notations first (which readers will frequently have to refer back to), then obscure ones or those with a large distance to their definitions.

<!-- Of course, all this only helps if it goes on top of focused effort to simplify and standardize your notation. -->

<!-- Read on for a discussion of the [design](#design-decisions) and more advanced [use cases](#more-use-cases). -->

# Design decisions

<details><summary>Why don't both commands take any parameters?</summary>

For `\traceDef`, it's so it can be placed anywhere, alongside what is written. To repeat the example from before:

```latex
A \traceDef\emph{trace} $\trace$ is a sequence of states...
```

On the other hand, `\trace` taking no argument may seem like a deficiency: how should we replace a `\newcommand` with parameters?

```latex
\newcommand*{\bigstep}[3]{#1\leadsto_{#2}#3}
% what's the \notation equivalent?

% a use
We define the relation \bigstep{e}{\trace}{v} as follows...
```

The reason is that we seldom want the entire term to become a link: it's possible we want to introduce notation for subterms, like the metavariable `e`.

My suggested way forward is to define notation for some essential symbol in the term, then use it in the definition of the term macro.

```latex
\notation{bigstepto}{\leadsto}
\newcommand*{\bigstep}[3]{#1\bigstepto_{#2}#3}

We define the relation \bigsteptoDef\bigstep{e}{\trace}{v} as follows...
```

This way, which portion becomes a link is always well-defined, and there is no problem with nesting notations.
</details>

<details><summary>Could we instrument <code>\newcommand</code>?</summary>

I briefly entertained the idea of instrumenting <code>\newcommand</code> to automate defining notations.
However, <code>\newcommand</code> is used for all kinds of things, not just definitions.
We would also have to handle the case of a command having parameters (see previous point).
</details>

<details><summary>Could we automatically link to the first use?</summary>

An early version of this defined a command that redefined itself after the first time it was used, so subsequent uses would link back to the first one.
This seemed like a nice idea, based on the assumption that "forward definitions" should be avoided.

However, this can be fragile when used with figures, which may end up ordered before any given text on a page, and it is sometimes natural to defer a formal definition until after an intuitive use has been explained.

The current simpler design, relying on manual annotation of the definition site, seems more robust.
</details>

# More use cases

It's sometimes useful to use the lower-level `\notationlink` and `\notationtarget` directly.
For example, say you typeset the names of inference rules in a special font.

```latex
\newcommand{\rulen}[1]{\ensuremath{{\bf \scriptstyle #1}}}
```

You can instrument it so that it adds a link, and define another variant for introducing a definition, which you then use in your inference rule.

```latex
\newcommand{\rulen}[1]{\notationlink{#1}{\ensuremath{{\bf \scriptstyle #1}}}}
\newcommand{\defrulen}[1]{\notationtarget{#1}{\ensuremath{{\bf \scriptstyle #1}}}}
```

If you have a mixfix judgment and want all the parts around the arguments to be links, adding an extra `\notationlink` is the easiest way to achieve this.

```latex
\notation{smodels}{\models}
\newcommand*{\bigstep}[3]{#1\smodels #2 \notationlink{smodels}{\leadsto} #3}
```

It may occasionally be helpful to explicate all uses and definitions, either to look for unlinked ones, or to ensure that definition sites are where you think they should be.
This can be done by simply removing the unobtrusive link colour and adding `\fbox{#1Def}` before `\notationlink` in the `\notation` macro above.

<!--

[^2]: [This paper](https://arxiv.org/abs/2006.11639) is an example in the wild where the authors underline newly-introduced terms.

Anchoring the definition to a specific word could also be done. A common convention is to italicise words, so authors could define:

```latex
\newcommand*{\firstuse}[1]{%
  \traceDef\emph{}}
```

it seems better not to make that choice and leave it to authors to define in a derived macro.

, e.g. `\traceDef{\emph{trace}}`, isn't much of an improvement. Also, the way in which notation is introduced is highly varied[^1][^2], so further structure seems counterproductive.

[^1]: One could further codify this convention of italicising introduced terms:

    ```latex
    \newcommand*{\firstuse}[1]{%
      \expandafter{\csname #1Def\endcsname}\emph{#1} \ensuremath{\csname #1\endcsname}}
    ```
    
    though in practice it's not often that the command name, the typeset content, and the way in which the symbol is introduced all coincide.

Not everything is introduced in a formal definition. Stuff implicitly like in a grammar saying x is a var without any other notation than just writing the nonterminal

Going even further generating an index
this is the point at which it starts to become yak shaving, but why not

Statements. Takes this idea to its conclusion. Might be a bit too heavyweight for people. If you want something lighter this is it


https://ctan.math.washington.edu/tex-archive/macros/latex/contrib/stex/sty/statements/statements.pdf

https://tex.stackexchange.com/questions/271745/link-to-definition-for-each-command-in-mathmode

https://www.overleaf.com/learn/latex/Indices

https://tex.stackexchange.com/questions/150849/a-command-to-define-other-commands-with-arguments


latex blog post

- this
    ```\
    sd '\\newcommand\*\{\\([^}]*)\}\{(.*)\}' '\\newsdefinition{$1}{$2}' macros.tex
    sd '\\newcommand\*\{\\([^}]*)\}\{(.*)\}' '\\notation{$1}{$2}' macros.tex
    ```
- clean up lol.tex
- redefining cmds https://tex.stackexchange.com/questions/71092/automatic-species-names-in-latex-command-that-does-something-differently-the-s
- https://tex.stackexchange.com/questions/104023/what-is-a-token
- https://tex.stackexchange.com/questions/556915/why-do-i-have-to-put-braces-around-my-macro-for-subscripts-indices
- commits in paper repo
- write the post
- New command star
- https://www.overleaf.com/learn/latex/Glossaries


% \notation{trace}{\tau} 

% A \firstuse{trace}{trace} $\trace$ is a sequence of states...

% \newcommand*{\zz}[0]{res}

% In the interest of simplicity, no syntax is provided for instrumenting/wrapping \newcommand.
% The idea is to use this to define terminals, then use the terminals in other macros, so just one part of. It's also unlikely you want the entire syntax to be highlighted, e.g. if you define a judgement A,B,C |= phi ~> D,E,F, this would allow you to make only (say) the ~> a link. But then again you probably don't want the entire thing to be made into a link. if A is a metavariable it to be a link to where it is first introduced.

% TODO
% newcommand*


% https://tex.stackexchange.com/questions/445597/how-to-link-to-the-references-in-the-definition
% https://damaru2.github.io/general/notations_with_links/


% https://tex.stackexchange.com/questions/521254/how-to-use-csname-to-call-a-command-with-an-argument
% https://tex.stackexchange.com/questions/302308/defining-a-command-to-define-an-asterisk-command
% https://tex.stackexchange.com/questions/73271/how-to-redefine-or-patch-the-newcommand-command
% https://tex.stackexchange.com/questions/287657/learning-to-use-xparse

% an earlier version found the first use and marked it. but this is fragile because for example, a figure might appear above the definition
% firstuse -> definition?

% can use incrementlly. don't have to define first use. though a bit pointless without

-->

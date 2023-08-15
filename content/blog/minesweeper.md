---
title: "Mouseover Minesweeper"
date: 2020-09-29 20:03:28 +0800
---

Automation in puzzle games is tricky to balance.
The issue is that puzzle games can involve some busywork, e.g. keeping track of the possibilities for each cell in Sudoku, and that removing the tedious parts allows the player to [focus on the "interesting" parts](https://www.playgoodsudoku.com/) of the puzzle.

Unfortunately, the parts of the game that are core to its experience can be quite subjective.
Automation can also quickly spiral out of control, where adding a single rule (e.g. transitivity) to a solver that barely helps makes it [practically solve the game completely](https://magnushoff.com/articles/minesweeper/), making you wonder what is left to "play".

# Chording

Something distinctive about Minesweeper is the use of a mouse chord: pressing both mouse buttons reveals the tiles around if it is safe to do so, given the number under the cursor.
If it is not safe, nothing is revealed; the player almost always then flags the tiles they think contain mines, then repeats the chord.

It's fun to chord away and perform small deductions, but on large boards, there is _a lot_ of chording and clicking, causing my hand to ache. Perhaps a justifiable example of tedium that could be removed?

To test that, I found a [nice open source version](https://github.com/amyngyn/minesweeper) and made a few small tweaks. Moving the mouse over a number either reveals or flags surrounding tiles automatically, whenever it is unambiguous what should be done. Try it out [here](https://dariusf.github.io/mouseover-minesweeper/)!

# Takeaways

Moving the mouse intentionally, the speed at which you can mow through the board is really quite thrilling.
The busywork that is automated is the repeated clicking; _where_ to click, arguably the intentional part of the action, is still left to the player.

The downside is that it's now possible to rely too much on automation, revealing most of the board by waving the mouse mindlessly, which is not really in the spirit of this change.
Accidental "spoilers" are also possible, if the mouse moves faster than you're thinking.
However, it's no worse than a solver which applies transitivity; at least you have to point at the tiles.
Also, how different is it really from clicking reflexively and drifting into pattern-matching mode?

While we're comparing, this does nothing about randomness (what [Magnus](https://magnushoff.com/articles/minesweeper/) mainly addresses), so it's still possible to lose from bad luck, e.g. in the first tile, or at the end of the game. My win rate did not improve, only my timing.

After trying it for a while, I found it difficult to play Minesweeper with the original controls and at the original speed, suggesting that this is an improvement.
At the same time, the ease with which boards can be mostly solved now makes me wonder if something was lost.

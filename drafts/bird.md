---
title: "SATB Bird"
date: 2019-10-24
---

Flappy Bird and choral singing have a lot in common.
Bird analogies, gestures, calls, and [songs](https://www.youtube.com/watch?v=4gCI3ySNNDU) are common in warmups, and in both activities, you are trying to steer a small flapping thing along a fine line through (your) pipes, backed by a lush (musical) landscape.

To make that less of a reach, I cobbled together a [prototype](https://github.com/dariusf/satb-bird) of a singing-powered Flappy Bird, based on an open source [clone](https://github.com/xviniette/FlappyLearning) of the game.
It would have been called _Flappy Lips_, but I settled on _SATB Bird_ to tease the upcoming multiplayer edition.

Like any rhythm game, SATB Bird requires an abundance of levels. Fortunately, people have been designing levels for _hundreds of years_ and making them freely available at the [Choral Public Domain Library](https://www.cpdl.org/wiki/).
The game reads them in MusicXML format and places the pipes accordingly.

There are two pitch detection implementations, a lightweight one using [autocorrelation](https://developer.microsoft.com/en-us/microsoft-edge/testdrive/demos/webaudiotuner/), and another using [ml5.js](https://ml5js.org/), which seems to perform slightly better.

The UI is quite unfinished, and due to the punishing difficulty, collision is currently off, in favour of a(n as yet unimplemented) scoring mechanism.

<!-- I haven't worked on it for a while so I decided to publish it. -->

Try it out [here](https://dariusf.github.io/satb-bird/).




Satb bird is a game. I would have called it flappy lips

The objective is to guide a small flapping ring through pipes. By blowing air, along a musical landscape
Link to vocal cords

https://youtu.be/3j92lXSwJHY

Well now you can do that on screen as well!

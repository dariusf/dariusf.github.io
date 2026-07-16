---
title: "Ordering events across live loops in Sonic Pi"
date: 2023-06-03
math: false
---

Sonic Pi has an elegant and well-thought [temporal semantics](https://in-thread.sonic-pi.net/t/what-does-time-mean-in-sonic-pi/4509). Using the following program as an example,

```ruby
sample :drum_bass_hard
play :c
sleep 1
sample :drum_cowbell
```

The drum sample and note can be thought of as starting simultaneously, and the cowbell will play precisely one second[^1] after.
In other words, `sleep` there isn't actually POSIX's `sleep` - it can be thought of as delimiting a section on a virtual timeline, a section which _does not include the time taken to start playing the sample and note_.

This enables a simple and declarative programming model.
Setting up two live loops like the following works as you would expect, i.e. they won't drift out of sync. If the sound card is overloaded, some sounds may not play, but live loops will remain in phase.

```ruby
live_loop :hihat do
  sample :drum_cymbal_closed
  sleep 0.25
end

live_loop :drums do
  sample :drum_bass_hard
  sleep 1
end
```

Well, mostly.
Live loops are Ruby threads, which are scheduled nondeterministically. As a result, events across threads within one time "partition" are unordered.

Consider this simplified example, which features communication across live loops. It's a fairly common scenario: we have a control loop that determines the key we're playing in, and one or more loops which adapt accordingly.

We're using `set` and `get` for deterministic (timeline-synced) state updates, and the `sync:` parameter to ensure that `melody` only starts when receiving a  _cue_ from `control`. Cues are sent every time a live loop begins executing its block.

```ruby
live_loop :control do
  set :n, [:c, :d, :e].tick
  sleep 1
end

live_loop :melody, sync: :control do
  play (get :n)
  sleep 1
end
```

We observe two surprising things.

1. The first note we hear is always `:d`, and always after a second of silence
2. The notes thereafter are some random subsequence of the ring `[:c, :d, :e]`

The [fix](https://in-thread.sonic-pi.net/t/live-loops-sync-questions/1172/13) for the first issue is to make the control loop start after a short delay.

```ruby
live_loop :control, delay: 0.1 do
  set :n, [:c, :d, :e].tick
  sleep 1
end
```

This happens because of Ruby's imperative nature and nondeterministic thread scheduling: when the first live loop starts executing in a thread, the cue it subsequently sends is unordered with respect to the second `live_loop` call (which executes on the main thread). Most of the time the cue is sent before the melody loop starts, causing it to miss playing the first note.
Thus the cue should be delayed until after the melody loop has (presumably[^2]) started.

<!-- The referenced forum thread contains a neat metaphor: musicians in a real-life orchestra should all be ready before the conductor gives them the cue start playing. Software does allow us to do better, however... -->

To address the second issue of notes missing, we could remove the `sync:` parameter and try using `sync` instead of `get`, which makes melody loop wait for the [next](https://in-thread.sonic-pi.net/t/a-tiny-script-for-your-hipster-lounge/4448/10) note.

```ruby
live_loop :melody do
  play (sync :n)
  sleep 1
end
```

Now, however, we hear only every other note.
The problem is that it is possible for the melody loop to miss cues while it is sleeping. I'm not sure if this is due to the time abstraction leaking (where we can observe one thread sleeping while another acts, despite the time "partition" being the same), or the ordering of cues not being well-defined with respect to other events in live loops.

Nevertheless, the solution is to ensure that the melody loop is not asleep when control loop cues. A simple way is to make sure there is always less sleep time in the former loop.

```ruby
live_loop :control, delay: 0.1 do
  set :n, [:c, :d, :e].tick
  sleep 1
end

live_loop :melody do
  play (sync :n)
  # we can do other things here, as long as we sleep < 1
end
```

# Conclusion

These are awfully subtle issues for beginners to debug.
I wish Sonic Pi had a simpler, more synchronous concurrency model, or at least provided more guarantees about the interleaving of events within a time partition.
It's quite likely that this is difficult to implement efficiently with its wealth of features, though.

[^1]: One beat, actually, but at the default BPM of 60, one beat occurs every second.

[^2]: Technically we're still not guaranteed that the second loop has started.

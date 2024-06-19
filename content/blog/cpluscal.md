---
title: "Choreographic PlusCal"
date: 2023-12-31 11:15:45 +0800
math: false
---

Choreographic PlusCal is a new specification language for distributed protocols.

```c
choreography
  (C \in coordinators);
  (P \in participants);
{
  all (c \in coordinators) {
    task C, "phase1" {
      all (p \in participants) {
        Transmit(c, p, "prepare");
        either {
          Transmit(p, c, "prepared");
        } or {
          Transmit(p, c, "aborted");
          cancel "phase1";
        }
      }
    };
    if (aborted) {
      all (p \in participants) {
        Transmit(c, p, "abort");
        Transmit(p, c, "aborted");
      }
    } else {
      all (p \in participants) {
        Transmit(c, p, "commit");
        Transmit(p, c, "committed");
      }
    }
  }
}
```

## Roles and parties

Protocol models in Choreographic PlusCal begin with definitions of _roles_, _parties_, and their local variables.

```c
choreography
  (F \in failure_detectors),
  (P \in participants)
  variables
    voted_yes = {},
    voted_no = FALSE,
    outcome = "none";
{
  ...
}
```

A _party_ is an identifier for a protocol participant, and is typically a model value.
Protocol participants have local state and communicate via messages.
A _role_ is a set of parties.

## choreography and Transmit

A `choreography` lives at the same level as a PlusCal `process`, and is special in that it describes the protocol _globally_, from the perspective of all parties simultaneously.

```c
choreography
  (C \in coordinators),
  (P \in participants);
{
  all (c \in coordinators) {
    all (p \in participants) {
      Transmit(c, p, "a");
      Transmit(p, c, "b");
    }
  }
}
```

Within a `choreography`, new global constructs can be used.
The most important is `Transmit` for sending messages, which can be arbitrary data.
Any network semantics can be specified for it by implementing simple `Send` and `Receive` macros.

```c
macro Send(from, to, type) {
  messages := messages \union {[To |-> to, From |-> from, Type |-> type]};
}

macro Receive(from, to, type) {
  await [To |-> to, From |-> from, Type |-> type] \in messages;
}
```

Choreographic PlusCal works by _projecting_ choreographies into regular PlusCal processes, so it fits nicely into the PlusCal translator pipeline.

## all and par

Multicasts are the workhorse of consensus and commit protocols, among other role-uniform operations.
These are expressible with `all`, which is dual to PlusCal's [`with`](https://lamport.azurewebsites.net/pubs/pluscal.pdf): instead of executing its body for an arbitrarily chosen element of a set, its body executes for _all_ elements of the set, _concurrently_.

```c
choreography
  (C \in coordinators),
  (P \in participants);
{
  all (c \in coordinators) {
    all (p \in participants) {
      Transmit(c, p, "prepare");
    }
  }
}
```

`par { ... } and { ... }`, which is dual to `either { ... } or { ... }`, is used for parallel composition of different blocks of statements, instead of the same block many times.

Unlike PlusCal process and Distributed PlusCal threads, `par` and `all` can be nested arbitrarily.
Both have a fork-join semantics when composed sequentially.

## Tasks and cancellation

`task`s delimit a block of statements which will no longer take effect following a `cancel`lation.

```c
all (p \in participants) {
  task P, "a" {
    par {
      cancel "a";
    } and {
      x := x + 2;
    }
  }
} \* x is 0 or 2 on each participant
```

In the Two-phase Commit example above, the task delimits the first phase of the protocol, which ends _as soon as_ the first `"aborted"` message is received.
Notably, the coordinator will no longer even _receive_ messages following the cancellation, and does not have to wait for `all` subprocesses to be "joined".

This provides a principled and easy way to implement such optimizations, which would otherwise be tricky to express.

Cancellation is also an interesting control flow primitive.
For example, it can be [used with loops](https://github.com/dariusf/tlaplus/blob/mbtc/cpcal.t/RaftLE.tla) to express infinite repetition of a task which completes to a different extent each time.

```c
while (TRUE) {
  task servers, "s" {
    par {
      \* A
      \* B
      \* C
    } and {
      cancel "s";
    }
  }
} \* produces the behavior (A(B(C)?)?)*
```


## Dynamic multirole protocols and self-sends

Protocols such as [Nonblocking Atomic Commit](https://github.com/dariusf/tlaplus/blob/mbtc/cpcal.t/NBAC.tla) feature intra-role communication, or _self-sends_. Others such as [Raft](https://github.com/dariusf/tlaplus/blob/mbtc/cpcal.t/RaftLE.tla) additionally have only a single static role, changing role dynamically based on node state.

```c
all (s \in servers) {
  Transmit(s, s, "RequestVote");
}
```

Choreographic PlusCal handles both in a principled way with a [projection function](/selfsends) based on the theory of dynamic multirole session types.

## Multiparty loops

_Multiparty loops_ allow repetition across multiple roles, with a termination condition for each role to be projected with respect to.

```c
all (c \in coordinators) {
  all (p \in participants) {
    while (y > 1), (x < 3) {
      Transmit(c, p, 5);
      y := y - 1;
      x := x + 1;
    }
  }
}
```

## Prototype

This project is a research prototype and its [implementation](https://github.com/dariusf/tlaplus/tree/mbtc) is mostly a proof-of-concept.
However, it is built on top of the TLA+ tools, so with more work it could someday be used to specify (and verify) real protocols.
Please get in touch if you are interested!

## Resources

- [Gallery of example programs](https://github.com/dariusf/tlaplus/tree/mbtc/cpcal.t)
- [How projection works](/selfsends)
- [The paper](https://dariusf.github.io/cpluscal.pdf), which contains an extensive tutorial-style introduction and lots of detail on how projection and translation to PlusCal work

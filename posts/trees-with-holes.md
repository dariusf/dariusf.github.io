---
title: "Trees with holes"
date: 2022-05-16
---

While working on a top-down synthesis prototype, I got distracted by the issue of how to represent incomplete program fragments, with holes to be filled in.

The simple way:

```ocaml
type expr =
  | One
  | Plus of expr * expr
  | Hole

let (__) = Hole

let hypothesis = Plus (__, __)
```

and this would probably have worked, but with quadratic-time substitution, since all the holes would be at the bottom of the tree.

How could we do better?[^1]

## Difference lists

[Difference lists](https://en.wikibooks.org/wiki/Prolog/Difference_Lists) originate in Prolog folklore.[^2]
Unlike regular lists, they end with a logic variable instead of an empty list.
When unified, the logic variable allows something to be appended to the list quickly, without rebuilding it.

<!--
https://swi-prolog.discourse.group/t/difference-list/959
-->

```
?- A = ([1,2|E],E), E = [3,4].
A =  ([1, 2, 3, 4], [3, 4]),
E = [3, 4].
```

The same idea works in functional languages:
a list like `[1; 2]` can be represented as the function `(fun x -> 1 :: 2 :: x)`.
Appending two lists is function composition, and once we apply the difference list to `[]` to recover a regular list, we only incur the cost of building it once, regardless of how the difference list was constructed. [Here](https://github.com/batsh-dev-team/Dlist) is an implementation where you can see how other list operations are implemented.

<!--
http://requestforlogic.blogspot.com/2011/08/holey-data-part-13-almost-difference.html

A Functional Representation of Data Structures with a Hole
-->

What would work for us is a difference list with a variable number of holes that don't all appear at the end.

## Difference trees

First, the type of our difference tree.

```ocaml
type t = int * (expr list -> expr)

(* Plus (One, __) *)
let example = (1, fun [e] -> Plus (One, e))
```

We now have a list of holes to fill, and we keep track of how many there are, since otherwise that information would be known only upon building the tree.

```ocaml
let concretize ((i, t) : t) : expr =
  t (List.init i (fun _ -> Hole))
```

Finally, the main operation of substituting _difference trees_ into difference trees.

```ocaml
let sub dts (i, t) =
  assert (List.length dts = i);
  let f r =
    let _rem, trees =
      List.fold_right
        (fun (i, ct) (tr, t) ->
          let used, rem = List.take_drop i tr in
          (rem, ct used :: t))
        dts (r, [])
    in
    t trees
  in
  let dts_arities = List.fold_right (fun (i, _) t -> i + t) dts 0 in
  (dts_arities, f)
```

If we substitute two trees with m and n holes into another with just two holes, the resulting tree should have (m + n) holes.
Furthermore, the holes `r` of the resulting tree `f` should be distributed amongst the child trees according to their arities.

We try a few examples and...

```ocaml
let a = (1, fun [e] -> Plus (e, One))
let b = (1, fun [e] -> Plus (One, e))
let c = (2, fun [e1; e2] -> Plus (e1, e2))
let c' = concretize (sub [a; b] c)
```

```ocaml
# c;;
- : int * (expr list -> expr) = (2, <fun>)

# c';;
- : expr = Plus (Plus (Hole, One), Plus (One, Hole))
```

... it works! A wrinkle is that we had to keep the `Hole` constructor around to be able to render the tree.

## Partial application

Holes are usually filled one by one, and it'd be nice if we didn't have to store all the arguments somewhere before using them.
We can extend substitution so that not all arguments have to be supplied upfront, and the remaining holes are preserved in the new tree.

```ocaml
let sub dts (i, t) =
  assert (List.length dts <= i);
  let dts_arities = List.fold_right (fun (i, _) t -> i + t) dts 0 in
  let remaining = i - List.length dts in
  let f r =
    assert (List.length r <= dts_arities + remaining);
    let rem_trees, r = List.take_drop remaining r in
    let _rem, child_trees =
      List.fold_right
        (fun (i, ct) (tr, t) ->
          let used, rem = List.take_drop i tr in
          (rem, ct used :: t))
        dts (r, [])
    in
    t (child_trees @ rem_trees)
  in
  (dts_arities + remaining, f)
```

This version is rather subtle: given a difference tree `(i, t)`, it produces another difference tree which knows how to rearrange its arguments so the complete application of `(i, t)` occurs (which is why we didn't have to handle partial application of child trees).
It also ensures that all the holes of parent trees are filled before those of child trees.[^3]

Now we're able to supply arguments to `c` one at a time:

```ocaml
let c' = concretize (sub [b] (sub [a] c))
```

```ocaml
# c';;
- : expr = Plus (Plus (Hole, One), Plus (One, Hole))
```

## Representing holes statically?

Having to write the arity separately when it could be given in the type of the function is another wrinkle.
We could try to use a GADT to [constrain](https://drup.github.io/2016/08/02/difflists/) the holes.
First, a type for the number of holes that a difference tree contains.

```ocaml
type z = Z
type 'a s = S of 'a

type _ holes =
  | S : 'a holes -> (expr -> 'a) holes
  | Z : expr holes

type 'a t = 'a holes * 'a
```

The arity of the function is now determined by the number of holes.

```ocaml
let a : (expr -> expr) t = (S Z, fun e -> Plus (e, One))
let b : (expr -> expr) t = (S Z, fun e -> Plus (One, e))
let c : (expr -> expr -> expr) t = (S (S Z), fun e1 e2 -> Plus (e1, e2))
```

We can even write `concretize`, using a locally abstract type, and pattern-matching on the number of holes remaining.

```ocaml
let rec concretize : type a. a t -> expr =
  fun (i, t) ->
    match i with
    | S i -> concretize (i, t Hole)
    | Z -> t
```

Unfortunately that was as far as I was able (and motivated) to go: it's unclear to me how to build an `f` with a number of arguments that depends on `(i, t)`, even if we change `dts` from a list to a single argument.
Even if we overcame that, all the folding and rearranging of arguments would certainly cause difficulty down the line.

## HOAS?

This is a much more coarse-grained notion of binding than what, say, [bindlib](https://github.com/rlepigre/ocaml-bindlib) implements, so if your trees have not just holes but free variables, or even binders lower in the tree instead of all at the top, definitely check that out.

## Conclusion

Code [here](https://gist.github.com/dariusf/f22f9c121e42f5bb9c2c85520baaba52).

[^1]: Ignoring the fact that our goal with top-down synthesis is not to let the trees get too large...

[^2]: [Difference Lists](https://www.cs.cmu.edu/~fp/courses/lp/lectures/11-diff.pdf), section 11.6

[^3]: This is currently the only order we can perform substitutions in. We could allow skipping arguments positionally using a placeholder difference tree value, or some (dynamic) way to address holes.

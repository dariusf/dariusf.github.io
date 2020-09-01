---
title: Relational algebra <=> SQL
theme: simple
highlightTheme: github
revealOptions:
    transition: none
    transitionSpeed: fast
    center: false
---

### SQL $\iff$ Relational algebra

$\sigma$

```sql
select * from t where 1=1;
                      ‾‾‾
```

$\pi$

```sql
select t.a, t.b from t;
       ‾‾‾‾‾‾‾‾
```

---

### SQL $\iff$ Relational algebra

$\times$

```sql
select * from a, b;
              ‾‾‾‾
```

$\rho$

```sql
select one.c as something from a one, a two;
       ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾        ‾‾‾    ‾‾‾
```

---

### SQL $\iff$ Relational algebra

$\cup$

```sql
select * from t union select * from s;
                ‾‾‾‾‾
```

$\cap$

```sql
select * from t intersect select * from s;
                ‾‾‾‾‾‾‾‾‾
```

$\setminus$

```sql
select * from t except select * from s;
                ‾‾‾‾‾‾
```

---

### Types

```sql
select * from t where 1=1;
‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

Relation, i.e. ~~set~~ bag of tuples

---

### Types

```sql
select * from t where 1=1;
              ‾
```

One or more _relations_

```sql
select * from (select * from t where 1=1) a where 2=2;
               ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

Compositional!

$$
\sigma_{2=2}(\sigma_{1=1}(t))
$$

Select-from-where $\approx\rho(\pi(\sigma(\rho(\ldots\times\ldots))))$

---

### Types

```sql
select * from t where 1=1;
                      ‾‾‾
```

Boolean

---

### Types

```sql
select * from t where 1=1;
       ‾
```

One or more...

1. Constant values, e.g. integers, text
1. Column names: ~~sets~~ bags of values
1. Aggregates: computations on bags of values

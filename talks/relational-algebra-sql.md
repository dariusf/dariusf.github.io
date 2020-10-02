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

### Relations

The result of a query is a relation, i.e. a ~~set~~ bag of tuples.

```sql
select * from t where 1=1;
‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

Queries act on one or more relations.

```sql
select * from t where 1=1;
              ‾
```

---

### Compositionality

```sql
select * from (select * from t where 1=1) a where 2=2;
               ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

$$
\sigma_{2=2}(\sigma_{1=1}(t))
$$

Select-from-where $\approx\rho(\pi(\sigma(\rho(\ldots\times\ldots))))$

---

### Where

```sql
select * from t where 1=1;
                      ‾‾‾
```

Boolean

---

### Select

```sql
select * from t where 1=1;
       ‾
```

One or more...

1. Constant values, e.g. integers, text
1. Column names: ~~sets~~ bags of values
1. Aggregation: computations on bags of values

---

### Aggregation

```sql
select max(a) from t;
‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

Result is a singleton relation.

Select-from-where, aggregation $\approx$

$$a(\rho(\pi(\sigma(\rho(\ldots\times\ldots)))))$$

---

### Having

Select-from-where, aggregation, having $\approx$

$$\sigma(a(\rho(\pi(\sigma(\rho(\ldots\times\ldots))))))$$

---

### Singleton relations as values

```sql
select (select 1);
        ‾‾‾‾‾‾‾‾
```

```sql
select * from t where t.a = (select sum(b) from s);
                      ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

---

### Exists

```sql
select * from t where exists (select * from s);
                      ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

exists : Relation $\to$ Boolean

---

### Correlated subqueries

```sql
select * from t
  where exists (select * from s where s.a = t.a);
               ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

```js
t.filter(ta =>
  s.filter(sa => sa === ta).length === 0)
  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

---

### Correlated subqueries + exists

```sql
select * from t
  where exists (select * from s where s.a = t.a);
        ‾‾‾‾‾‾
```

```js
t.filter(ta =>
  s.filter(sa => sa === ta).length === 0)
                           ‾‾‾‾‾‾‾‾‾‾‾‾‾
```

exists : ~~Array~~ Relation $\to$ Boolean

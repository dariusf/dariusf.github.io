---
layout: post
title: Lambda Expressions in Java 8
excerpt: What they are... and what they aren't!
modified: 2014-08-02
tags: [java, javafx, functional programming, lambda]
---
I was pretty excited when Java 8 was released. I'd heard a little about the cool new features and they'd been building hype for months, so I dove right in when I got the chance to work on [HubTurbo](http://dariusf.github.io/projects/hubturbo). Of course, I didn't fully understand what I was doing, but hey, lambda expressions. Everything I'd done with them in other languages was possible!

Needless to say that mindset caused us teething problems. The bright side was that by the end of the project I'd gained a much better understanding of what lambda expressions are in Java, and more importantly, what they *aren't*. Here are a few things I've learned about them.

## Lambda expressions are just objects.

For me this realisation was key to understanding some of the caveats involved with their use.

Lambda expressions are the conceptually similar to the anonymous inner classes of Java 7, but without the boilerplate. The compiler helps out with some type inference, and also figures out when a lambda expression may replace an anonymous inner class.

If it's just syntactic sugar though, what's the actual benefit? True -- on their own, lambda expressions don't enable anything that wasn't already possible in Java 7. They do, however, change what is *plausible*, as the boilerplate involved with anonymous classes is quite prohibitive to writing code in a functional style. A more expressive language is always good.

## Lambda expressions are mostly what you'd expect...

They are lexically scoped. They are first-class constructs and can be stored in data structures and returned from functions.

Closures allow you to build data structures, like in other functional languages:

{% highlight java %}
// Is there a right way to indent this?
Function<Integer,
    Function<Integer,
        Function<Boolean, Integer>>> pair =
            (x) -> (y) -> (b) -> b ? x : y;

// Constructing a pair of two integers
Function<Boolean, Integer> tuple = pair.apply(1).apply(2);

tuple.apply(true); // 1
tuple.apply(false); // 2
{% endhighlight %}

Curried functions and other higher-order programming are *somewhat* possible, but the type signatures are verbose and there is no `var` or `auto` keyword to alleviate that.

Like anonymous inner classes, local variables that lambda expressions capture in the surrounding scope must be (effectively) final.

Unlike anonymous inner classes, shadowing of a name already declared in the enclosing environment is not allowed. This is perhaps a good thing.

## ... except you can't invoke a lambda expression directly...

My first impression was that a lambda expression was a method reference (especially given the new `::` operator). Thus, this restriction made no sense at first -- couldn't you just apply it?

That a lambda expression is an object helps explain this. 'Invoking it' is a matter of invoking *one of its methods*. Java doesn't have true first-class functions, in other words.

Being an anonymous object, a lambda expression could in fact represent *any* object containing one method with its particular signature. We can reach the method as long as we know the interface the object conforms to.

That's where [functional interfaces](http://docs.oracle.com/javase/8/docs/api/java/lang/FunctionalInterface.html) come in. To be more precise, a functional interface has exactly one abstract method. The annotation `@FunctionalInterface` exists for making this explicit.

A lambda expression of some signature can be substituted wherever an object containing a method of that signature can go, and the compiler handles the translation between them. Whether or not the `::` operator returns a method reference internally, you need an interface to make anything of the value you get from it.

`java.util.function` comes with [interfaces for the more commonly-used signatures](http://docs.oracle.com/javase/8/docs/api/java/util/function/package-summary.html). To name a few:

{% highlight java %}
Predicate<T> // Takes one argument, returns boolean
BiPredicate<T, U> // Takes two arguments, returns boolean

IntPredicate // Specialised primitive types
DoublePredicate
LongPredicate

Function<T, U>
BiFunction<T, U, V>
Function<Void, Void> // java.lang.Runnable would also work
{% endhighlight %}

To invoke a lambda expression, you must bind it to a name with a known interface, then use the name to call its method.

What if you need a signature that's not on that list? Hard luck. You'll have to define your own interface.

While it's clunky, in practice you seldom need more than an arity of 3 or so (anecdotal). It's also ugly that to specialise the interfaces for primitives you have to hard-code the types, but they do seem to have a lot of common use cases covered.

Another consideration for defining a functional interface is error-handling. I say I need a `TriFunction`, perhaps for some kind of ternary operator.

{% highlight java %}
@FunctionalInterface
interface TriFunction<T, U, V, W> {
    public abstract W apply(T t, U u, V v);
}
{% endhighlight %}

What happens if code inside the `apply` method does something illegal? Surely an exception would be thrown?

### ... and exceptions must be (generally) caught in the expression body.

Consider this code:

{% highlight java %}
Runnable func = () -> {
    throw new Exception("Something illegal");
};
try {
    func.run();
} catch (Exception e) {
    System.out.println("Exception caught!");
}
{% endhighlight %}

It looks reasonable, but won't compile: the compiler complains that the exception is unhandled.

Once again, this behaviour stems from the fact that `func` isn't a first-class function. The body of the lambda expression is actually the method body of a `Runnable` object, and because `Runnable` has this definition...

{% highlight java %}
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
{% endhighlight %}

... the `run` method can't throw exceptions. It's like invoking a method whose signature you can't change. Moving the `try` block into the lambda expression body allows everything to work.

This is a minor inconvenience you'll have to deal with when using the standard functional interfaces. You won't be able to catch errors of the same type across a bunch of lambda expressions, for example.

Sometimes the error should conceptually be handled outside the lambda expression. For example you might only care if an entire operation succeeded or not, and not which of the parts inside failed. Defining a custom functional interface which throws the appropriate exception would enable this. All uses of that functional interface must then be wrapped in a `try` block. Perhaps a necessary compromise.

### Lambda the Unchecked

[Unchecked exceptions](http://docs.oracle.com/javase/tutorial/essential/exceptions/runtime.html) don't require an explicit `throws` declaration or `try` block. As such they can be thrown from the bodies of lambda expressions no matter their signature. If we change the type of exception thrown in the example from before, it compiles.

{% highlight java %}
Runnable func = () -> {
    throw new RuntimeException("Something illegal");
};
try {
    func.run();
} catch (Exception e) {
    System.out.println("Exception caught!");
}
{% endhighlight %}

Generally the exception surfaces at the right place: in this case, `func.run()`, where the lambda expression was invoked. With libraries, however, you can never be sure where the error is actually handled. The library may have its own error-handling mechanisms, and the error might never propagate back to your code as an exception.

A simplified real-world example:

{% highlight java %}
CompletableFuture<Boolean> future = new CompletableFuture<>();
future.thenApply(success -> {
    int a = 1 / 0;
    setState(a);
    return success;
});
performAsyncTask(future);
{% endhighlight %}

Here we're using a `CompletableFuture` to capture the result of some asynchronous task. When the task completes a division by zero occurs, but the callback *fails silently*! It happens that `CompletableFuture` catches exceptions and pipes them into an `exceptionally` clause, which we forgot here. `setState`, a function with side effects, is never executed, which could be a source of bugs.

This is more of a problem with unchecked exceptions in general, but I thought it worth mentioning because of the interaction with lambda expressions. In short, be aware of how libraries handle errors in callbacks. If they don't handle errors... well, that's actually a decent outcome, because the exception will appear where you expect it to.

## In closing,

Lambda expressions have enabled advancements to the Collections API with streams. Callback functions were given a nice boost in usability. New abstractions are feasible (functional parser combinators, anyone?).

I don't think Java will ever be a truly functional language (which, admittedly, was what I was naively expecting when I came into Java 8). Still, it has gained a wealth of functional abstractions, which perhaps is good enough for now.
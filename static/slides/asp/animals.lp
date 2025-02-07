animal(puppy;bird).

legs(puppy,4).
legs(bird,2).

animal_n(1..15).
{ animal_at_shop(A, N) : animal(A) } = 1 :- animal_n(N).
correct_number_of_legs :- legs_total(42).
:- not correct_number_of_legs.
legs_total(L) :- L = #sum { N,M : animal_at_shop(A, M), legs(A, N) }.

animal_count(A,N) :- N = #count { M : animal_at_shop(A, M) }, animal(A).

#show animal_count/2.
#project animal_count(A,N).

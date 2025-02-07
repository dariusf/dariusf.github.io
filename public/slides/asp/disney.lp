


%% Adam's minimal event calculus formalism:
%% - only true holds/happens are tracked
%% - all fluents are always inertial
%% - time is a totally ordered contiguous integer sequence
%% - events and fluents are self-contained terms
%% - T variables always come first for easy sorting
initiated(T,F) :- happens(T,E), initiates(T,E,F).
terminated(T,F) :- happens(T,E), terminates(T,E,F).
holds(T+1,F) :- time(T), holds(T,F), not terminated(T,F).
holds(T+1,F) :- time(T), happens(T,E), initiates(T,E,F).

#const t_max=15.
time(0..t_max).

{ happens(T,E) } :- time(T), possible(T,E).
:- time(T), not 1 { happens(T,E) } 1.

%#hide.
% #show sparks_flying/2.
#show happens/2.
% #show holds/2.
% #show initiated/2.
% #show terminated/2.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%



% tropes like reversal
% force lightning
% alignment
% turning to the dark side

character(rey).
character(kylo).
character(palpatine).

side(light).
side(dark).

item(wayfinder).

place(pasaana).
place(kijimi).
place(endor).
place(exegol).
place(resistance_base).
place(tatooine).

always_reachable(resistance_base,pasaana).
always_reachable(pasaana,kijimi).
always_reachable(kijimi,endor).
always_reachable(exegol,endor).
always_reachable(exegol,kijimi).
always_reachable(exegol,tatooine).

holds(0,reachable(P1,P2)) :- place(P1), place(P2), always_reachable(P1,P2).

% MacGuffin rule
holds(T,reachable(P,exegol)) :- holds(T-1, has(rey,wayfinder)), time(T), place(P).

holds(0,alignment(rey,light)).
holds(0,alignment(kylo,dark)).
holds(0,alignment(palpatine,dark)).

holds(0,at(kylo,exegol)).
holds(0,at(rey,resistance_base)).
holds(0,at(palpatine,exegol)).

holds(0,has(endor,wayfinder)).

holds(0,alive(C)) :- character(C).






possible(T,moves(C,P1,P2)) :-
  holds(T,at(C,P1)), not holds(T,at(C,P2)),
  holds(T,reachable(P1,P2)),
  holds(T,alive(C)),
  character(C), place(P1), place(P2).
initiates(T,moves(C,P1,P2),at(C,P2)) :- possible(T,moves(C,P1,P2)).
terminates(T,moves(C,P1,P2),at(C,P1)) :- possible(T,moves(C,P1,P2)).

possible(T,finds(C,I,P)) :-
  holds(T,at(C,P)),
  not holds(T,has(C,I)), holds(T,has(P,I)),
  holds(T,alive(C)),
  character(C), item(I), place(P), time(T).
initiates(T,finds(C,I,P),has(C,I)) :- possible(T,finds(C,I,P)).
terminates(T,finds(C,I,P),has(P,I)) :- possible(T,finds(C,I,P)).

possible(T,turns(C1,C2,S1,S2)) :-
  holds(T,alignment(C2,S1)), not holds(T,alignment(C2,S2)),
  holds(T,at(C1,P)), holds(T,at(C2,P)),
  holds(T,alignment(C1,S2)),
  holds(T,alive(C1)), holds(T,alive(C2)),
  place(P), character(C1), character(C2), side(S1), side(S2).
initiates(T,turns(C1,C2,S1,S2),alignment(C2,S2)) :- possible(T,turns(C1,C2,S1,S2)).
terminates(T,turns(C1,C2,S1,S2),alignment(C2,S1)) :- possible(T,turns(C1,C2,S1,S2)).

possible(T,lightsaber_duel(C1,C2)) :-
  C1 != C2,
  holds(T,alignment(C1,S1)), holds(T,alignment(C2,S2)), S1 != S2,
  holds(T,at(C1,P)), holds(T,at(C2,P)),
  holds(T,alive(C1)), holds(T,alive(C2)),
  place(P), character(C1), character(C2), side(S1), side(S2), time(T).
terminates(T,lightsaber_duel(C1,C2),alive(C2)) :- possible(T,lightsaber_duel(C1,C2)).

reason(the_dark_side_of_the_force_is_a_pathway_to_many_abilities_some_consider_to_be_unnatural).
reason(it_was_all_a_dream).
reason(it_was_a_clone).
reason(it_was_a_hologram).
reason(force_healing).

% this isn't the most efficient it could be
{ pick_reason(T,plot_point_reversal(C,R)) : reason(R) } = 1 :-
  character(C), time(T).
% #show pick_reason/2.

possible(T,plot_point_reversal(C,R)) :-
  not holds(T,alive(C)),
  pick_reason(T,plot_point_reversal(C,R)),
  place(P), character(C), time(T).
initiates(T,plot_point_reversal(C,R),alive(C)) :- possible(T,plot_point_reversal(C,R)).

%% Planning goals

rey_reaches_exegol :- holds(t_max+1,at(rey,exegol)).
:- not rey_reaches_exegol.

turn :- happens(T,turns(C1,C2,S1,S2)), character(C1), character(C2), side(S1), side(S2).
:- not turn.

climax :- happens(T,lightsaber_duel(C1,C2)), character(C1), character(C2).
:- not climax.

anticlimax :- happens(T,plot_point_reversal(C,R)), character(C), reason(R).
:- not anticlimax.


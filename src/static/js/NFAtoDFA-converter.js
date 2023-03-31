let LAST_COMPLETED_STEP_COUNT = 0

class NFA {
  constructor(initialState, finalStates, states, alphabet, transitions) {
    if (!Array.isArray(finalStates)) {
      let arr = [];
      arr.push(finalStates.toString());
      finalStates = arr;
    }

    if (!Array.isArray(alphabet)) {
      let arr = [];
      arr.push(alphabet.toString());
      alphabet = arr;
    }

    if (!Array.isArray(transitions)) {
      let arr = [];
      arr.push(transitions);
      transitions = arr;
    }

    this.initialState = initialState;
    this.finalStates = finalStates;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
  }

  formatDotState(stateString) {
    stateString = stateString.toString();
    if (isMultipleState(stateString)) {
      stateString = stateString.substring(1, stateString.length - 1);
      stateString = stateString.replace(/,/g, "");
      return stateString;
    } else {
      return stateString;
    }
  }

  toDotString() {
    let dotStr = "digraph fsm {\n";
    dotStr += "rankdir=LR;\n";
    dotStr += 'size="8,5";\n';
    dotStr += "node [shape = point]; INITIAL_STATE\n";
    dotStr +=
      "node [shape = doublecircle]; " + this.finalStates.join(",") + ";\n";
    dotStr += "node [shape = circle];\n";
    dotStr +=
      "INITIAL_STATE -> " + this.formatDotState(this.initialState) + ";\n";

    for (let i = 0; i < this.transitions.length; i++) {
      let tmp = this.transitions[i];

      dotStr += "" + this.formatDotState(tmp.state) +
        " -> " + this.formatDotState(tmp.nextStates) +
        "[label=" + tmp.inputSymbol + "];\n";
    }
    dotStr += "}";
    return dotStr;
  }
}

class Transition {
  constructor(state, nextStates, inputSymbol) {
    if (!(typeof state === "string" || state instanceof String))
      throw new Error("Expected a single state (string)");

    if (!Array.isArray(nextStates)) {
      let arr = [];
      arr.push(nextStates.toString());
      nextStates = arr;
    }

    this.state = state;
    this.nextStates = nextStates;
    this.inputSymbol = inputSymbol;
  }
}

function NFA_epsilonClosure(nfa) {
  let hasEpsilon = false;
  for (let t of nfa.transitions) {
    if (t.inputSymbol === "" || t.inputSymbol === "\u03B5") {
      hasEpsilon = true;
      break;
    }
  }

  if (!hasEpsilon) {
    return nfa;
  }

  let nfaClosedTransitions = [];
  let nfaClosedFinalStates = [];

  for (let i = 0; i < nfa.states.length; i++) {
    let state = nfa.states[i];
    let stateClosure = getEpsilonClosure(state, nfa.transitions);

    for (let j = 0; j < nfa.alphabet.length; j++) {
      let symbol = nfa.alphabet[j];
      let symbolNextStates = [];

      for (let k = 0; k < state.length; k++) {
        let nextStates = findNextStates(stateClosure[k], symbol, nfa.transitions);

        if (nextStates.length !== 0) {
          for (let l = 0; l < nextStates.length; l++) {
            let closure = getEpsilonClosure(nextStates[l], nfa.transitions);

            for (let m = 0; m < closure.length; m++) {
              let addElement = closure[m];

              if (!symbolNextStates.includes(addElement)) {
                symbolNextStates.push(addElement);
              }
            }
          }
        }
      }
      symbolNextStates.sort();

      console.log(
        "NFA Closure: " +
        state +
        " -> " +
        symbol +
        " = " +
        symbolNextStates +
        " (Length " +
        symbolNextStates.length +
        ")"
      );

      nfaClosedTransitions.push(new Transition(state, symbolNextStates, symbol));
    }
  }

  nfaClosedFinalStates.sort();


  let initialStateClosure = getEpsilonClosure(nfa.initialState, nfa.transitions);

  let isInitClosureHasFinalState = false;

  for (let finalState of nfa.finalStates) {
    if (initialStateClosure.includes(finalState)) {
      isInitClosureHasFinalState = true;
      break;
    }
  }

  if (isInitClosureHasFinalState) {
    nfa.finalStates.push(nfa.initialState);
  }

  nfa = new NFA(nfa.initialState, nfa.finalStates, nfa.states, nfa.alphabet, nfaClosedTransitions);


  console.log("--- Lambda NFA ---");
  console.log(nfa.toDotString());
  console.log("--___--");
  return nfa;
}

function generateDFA(nfa, stepCNTStop = -1) {
  let stepCNT = 0;
  let stepInterrupt = false;

  nfa = NFA_epsilonClosure(nfa);

  let DFAStates = [];
  let DFAFinalStates = [];
  let DFATransitions = [];

  let waitStack = [];

  DFAStates.push(nfa.initialState);
  waitStack.push(nfa.initialState);

  while (waitStack.length > 0) {
    let state = waitStack.pop();
    console.log("Pop'd state: " + state);
    if (++stepCNT === stepCNTStop) {
      stepInterrupt = true;
      break;
    }

    let states;

    if (isMultipleState(state)) {
      states = separateStates(state);
    } else {
      states = [];
      states.push(state);
    }

    for (let i = 0; i < nfa.alphabet.length; i++) {
      let nextStateUnion = [];

      for (let j = 0; j < states.length; j++) {
        let ns = findNextStates(states[j], nfa.alphabet[i], nfa.transitions);
        for (let k = 0; k < ns.length; k++) {
          if (!nextStateUnion.includes(ns[k])) {
            nextStateUnion.push(ns[k]);
          }
        }

        let combinedStatesUnion = combineStates(nextStateUnion);

        if (combinedStatesUnion != null) {
          DFATransitions.push(new Transition(state, combinedStatesUnion, nfa.alphabet[i]));

          if (!DFAStates.includes(combinedStatesUnion)) {
            console.log(
              state + ", " + nfa.alphabet[i] + " -> " + combinedStatesUnion
            );
            DFAStates.push(combinedStatesUnion);
            waitStack.push(combinedStatesUnion);
          } else {
            console.log("TRAP state needed");

            if (!DFAStates.includes("TRAP")) {
              for (let n = 0; n < nfa.alphabet.length; n++)
                DFATransitions.push(
                  new Transition("TRAP", ["TRAP"], nfa.alphabet[n])
                );

              DFAStates.push("TRAP");
            }

            DFATransitions.push(new Transition(state, ["TRAP"], nfa.alphabet[i]));
          }
        }
      }
    }
  }

  console.log("--- NFA Final States ---");
  console.log(nfa.finalStates);
  console.log("-----");

  for (let i = 0; i < DFAStates.length; i++) {
    let dfa_sep_states = separateStates(DFAStates[i]);

    for (let j = 0; j < nfa.finalStates.length; j++) {
      console.log(
        "Does " + dfa_sep_states + " include " + nfa.finalStates[j] + "?"
      );

      if (dfa_sep_states.includes(nfa.finalStates[j])) {
        DFAFinalStates.push(nfa.formatDotState(DFAStates[i]));
        break;
      }
    }
  }

  if (!stepInterrupt) {
    LAST_COMPLETED_STEP_COUNT = stepCNT;
    console.log("LAST_COMPLETED_STEP_COUNT = " + stepCNT);
  }

  return new NFA(
    nfa.initialState,
    DFAFinalStates,
    DFAStates,
    nfa.alphabet,
    DFATransitions
  );
}

function minimizeDFA(dfa) {
  for (let state of dfa.states) {
    for (let state2 of dfa.states) {
      if (
        state !== state2 &&
        dfa.finalStates.includes(dfa.formatDotState(state)) ===
        dfa.finalStates.includes(dfa.formatDotState(state2))
      ) {

        let statesEqual = true;

        for (let symbol of dfa.alphabet) {

          let state1_nextStates = findNextStates(
            state,
            symbol,
            dfa.transitions
          );
          let state2_nextStates = findNextStates(
            state2,
            symbol,
            dfa.transitions
          );

          if (!arraysEqual(state1_nextStates, state2_nextStates)) {
            statesEqual = false;
          }
        }

        if (statesEqual) {
          let remove = state;
          let replace = state2;

          console.log(remove);
          console.log(replace);
          console.log(dfa.initialState);

          if (dfa.initialState === remove) {
            remove = state2;
            replace = state;
          }

          console.log(
            "The two states are equal [" + remove + " = " + replace + "]"
          );

          if (remove === "TRAP") {
            console.log("Trap state will not be removed.");
            continue;
          }

          console.log(dfa.states);
          console.log("Delete " + remove);

          dfa.states = dfa.states.filter(function (s) {
            return dfa.formatDotState(s) !== dfa.formatDotState(remove);
          });

          dfa.transitions = dfa.transitions.filter(function (t) {
            if (t.state !== remove) {
              if (t.nextStates[0] === remove) {
                t.nextStates[0] = replace;
              }
              return true;
            } else {
              return false;
            }
          });

          dfa.finalStates = dfa.finalStates.filter(function (s) {
            return dfa.formatDotState(s) !== dfa.formatDotState(remove);
          });
        }
      }
    }
  }

  return dfa;
}

function isMultipleState(state) {
  state = state.toString();
  return state.startsWith("{") && state.endsWith("}");
}

function getEpsilonClosure(state, transitions) {
  let epsilonClosure = [];
  epsilonClosure.push(state);

  for (let i = 0; i < transitions.length; i++) {
    let tmpTransition = transitions[i];
    if (tmpTransition.inputSymbol.trim() === "" || tmpTransition.inputSymbol === "\u03B5") {
      if (state === tmpTransition.state) {
        for (let j = 0; j < tmpTransition.nextStates.length; j++) {
          if (!epsilonClosure.includes(tmpTransition.nextStates[j])) {
            epsilonClosure.push(tmpTransition.nextStates[j]);

            let subEpsilonClosure = getEpsilonClosure(tmpTransition.nextStates[j], transitions);

            for (let j = 0; j < subEpsilonClosure.length; j++) {
              if (!epsilonClosure.includes(subEpsilonClosure[j])) {
                epsilonClosure.push(subEpsilonClosure[j]);
              }
            }
          }
        }
      }
    }
  }

  return epsilonClosure;
}

function findNextStates(state, inputSymbol, transitions) {
  let nextStates = [];

  for (let i = 0; i < transitions.length; i++) {
    let tmpTransition = transitions[i];

    if (tmpTransition.state === state && tmpTransition.inputSymbol === inputSymbol) {
      for (let j = 0; j < tmpTransition.nextStates.length; j++) {
        if (!nextStates.includes(tmpTransition.nextStates[j])) {
          nextStates.push(tmpTransition.nextStates[j]);
        }
      }
    }
  }
  return nextStates;
}

function separateStates(state) {
  if (!isMultipleState(state)) {
    return state;
  }
  return state.substring(1, state.length - 1).split(",");
}

function combineStates(states) {
  if (!Array.isArray(states)) {
    throw new Error("Array expected for combineStates() function");
  }

  states = states.filter(function (e) {
    return e != null;
  });

  if (states.length > 0 && Array.isArray(states[0])) {
    console.warn("Sub-arrays are not expected for combineStates() function");
    states = states[0];
  }

  if (states.length === 0) {
    return null;
  }

  states.sort();

  if (states.length === 1) {
    return states[0].toString();
  }

  let state = "{";
  for (let i = 0; i < states.length; i++) {
    state += states[i] + ",";
  }

  state = state.trim().replace(/,+$/, "");
  state += "}";

  return state;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if ((a == null || b == null) || a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
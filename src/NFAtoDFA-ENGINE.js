class NFA {
  constructor(initialState, finalState, states, alphabet, transitions) {
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
        "[label=" + tmp.inputSymbol + "];\n" + "}";

      return dotStr;
    }
  }
}

class Transition {
  constructor(state, nextStates, inputSymbol) {
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
      }
    }
  }
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
        for (let j = 0; j < tmpTransition.length; j++) {
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
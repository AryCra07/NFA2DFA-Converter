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

function epsilonClosureNFA(nfa) {
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

    let nfa_closed_transitions = [];
    let nfa_closed_final_states = [];

    for (let i = 0; i < nfa.states.length; i++) {
        let state = nfa.states[i];
        let state_closure = fetchEpsilonClosure(state, nfa.transitions);

        for (let j = 0; j < nfa.alphabet.length; j++) {

        }

    }


}

function isMultipleState(state) {
    state = state.toString();
    return state.startsWith("{") && state.endsWith("}");
}

function fetchEpsilonClosure(state, transitions) {
    let epsilonClosure = [];
    epsilonClosure.push(state);

    for (let i = 0; i < transitions.length; i++) {
        let tmpTransition = transitions[i];
        if (tmpTransition.inputSymbol.trim() === "" || tmpTransition.inputSymbol === "\u03B5") {
            if (state === tmpTransition.state) {
                for (let j = 0; j < tmpTransition.length; j++) {
                    if (!epsilonClosure.includes(tmpTransition.nextStates[j])) {
                        epsilonClosure.push(tmpTransition.nextStates[j]);
                    }
                }
            }
        }
    }
}
class Transition {
    constructor(state, nextStates, inputSymbol) {
        if (!(typeof state === "string" || state instanceof String)) {
            throw new Error("Expected a single state(string)");
        }

        if (!Array.isArray(nextStates)) {
            console.warn("Expected nextStates in transition to be an array");
            let arr = [];
            arr.push(nextStates.toString());
            nextStates = arr;
        }
    }
}
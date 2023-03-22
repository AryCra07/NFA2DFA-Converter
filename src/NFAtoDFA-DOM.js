class UserInput {
    constructor(initState, finalStates, states, alphabet, transitions) {
        this.initState = initState;
        this.finalStates = finalStates;
        this.states = states;
        this.alphabet = alphabet;
        this.transitions = transitions;
    }
}

$(document).ready(function () {
    $("#new-transition").click(function () {
        let transitionsDiv = $("#nfa-transitions");
        let elementClone = $("#nfa-transitions .production-row").last().clone(true);

        elementClone.appendTo(transitionsDiv);

        $(".remove-button").show();
    });

    let removeButton = $(".remove-button");

    if (document.getElementsByClassName('remove-button').length === 1)
        removeButton.hide();

    removeButton.click(function () {
        let parent = $(this).parent();
        let grandparent = parent.parent();

        parent.remove();
        $("#verify-update-debug").click();

        if (grandparent.children().length == 1) {
            $(".remove-button").hide();
        }
    });


    $(".production-row input").on("keypress", function (e) {
        if (e.which === 13) {
            $("new-transition").click();
        }
    });

    $(".production-row input")("keyup", function (e) {
        if (e.which !== 13) {
            $("#verify-update-debug").click();
        }
    });

    $("#initialStateInput").on("keyup", function (e) {
        $("#verify-update-debug").click();
    });

    $("#finalStateInput").on("keyup", function (e) {
        $("#verify-update-debug").click();
    });

    $("#exampleBtn").click(function () {
        $("#initialStateInput").val("q0");
        $("#finalStatesInput").val("q1");

        let transitionsDiv = $("#nfa-transitions");
        let clone = $("#nfa-transitions .production-row").first().clone(true);

        transitionsDiv.children().each(function () {
            $(this).remove();
        });

        clone.find(".current-state-input").val("q0");
        clone.find(".input-symbol").val("a");
        clone.find(".next-states").val("q1");
        transitionsDiv.append(clone);

        clone = clone.clone(true);
        clone.find(".current-state-input").val("q0");
        clone.find(".input-symbol").val("");
        clone.find(".next-states").val("q1");
        transitionsDiv.append(clone);

        clone = clone.clone(true);
        clone.find(".current-state-input").val("q1");
        clone.find(".input-symbol").val("a");
        clone.find(".next-states").val("q0");
        transitionsDiv.append(clone);

        clone = clone.clone(true);
        clone.find(".current-state-input").val("q1");
        clone.find(".input-symbol").val("b");
        clone.find(".next-states").val("q1");
        transitionsDiv.append(clone);

        clone = clone.clone(true);
        clone.find(".current-state-input").val("q1");
        clone.find(".input-symbol").val("a");
        clone.find(".next-states").val("q2");
        transitionsDiv.append(clone);

        clone = clone.clone(true);
        clone.find(".current-state-input").val("q1");
        clone.find(".input-symbol").val("b");
        clone.find(".next-states").val("q2");
        transitionsDiv.append(clone);

        clone = clone.clone(true);
        clone.find(".current-state-input").val("q2");
        clone.find(".input-symbol").val("a");
        clone.find(".next-states").val("q2");
        transitionsDiv.append(clone);

        clone = clone.clone(true);
        clone.find(".current-state-input").val("q2");
        clone.find(".input-symbol").val("b");
        clone.find(".next-states").val("q1");
        transitionsDiv.append(clone);

        $(".remove-button").show();
        $("#verify-update-debug").click();
    });

    $("#resetBtn").click(function () {
        $("#initialStateInput").val("");
        $("#finalStatesInput").val("");
        $(".remove-button").slice(1).click();
        $(".remove-button").hide();
        $("#nfa-transitions input").val("");
        $("#current-nfa").empty();
        $("#current-dfa").empty();
        $("#current-dfa-minimized").empty();
        $("#step-div").empty();
    });

    function fetchUserInput() {
        let initialState = $("initialStateInput").val().trim();
        let finalState = $("finalStatesInput").val().trim();
        let states = [];
        let alphabet = [];
        let transitions = [];

        if (initialState.includes("{") || finalStates.includes("{")) {
            alert('State names cannot contain the "{" character!');
            return null;
        }

        $(".production-row").each(function () {
            let currentState = $(this).find(".current-state-input").val().trim();
            let inputSymbol = $(this).find(".input-symbol").val().trim();

            if (inputSymbol === "") inputSymbol = "\u03BB"; //lambda character

            let nextState = $(this).find(".next-states").val().trim();

            // TODO Better state validation?
            if (currentState.includes("{") || nextState.includes("{")) {
                alert('State names cannot contain the "{" character!');
                return;
            }

            transitions.push(new Transition(currentState, nextState, inputSymbol));

            // Populate alphabet without lambda
            if (inputSymbol !== "\u03BB" && !alphabet.includes(inputSymbol))
                alphabet.push(inputSymbol);

            if (!states.includes(currentState)) states.push(currentState);

            if (!states.includes(nextState)) states.push(nextState);
        });

        if (finalStates.includes(",")) finalStates = finalStates.split(",");

        return new UserInput(
            initialState,
            finalStates,
            states,
            alphabet,
            transitions
        );
    }

    $("#verify-update-debug").click(function () {
        let userInput = fetchUserInput();

        let dotStr = "digraph fsm {\n";
        dotStr += "rankdir=LR;\n";
        dotStr += 'size="8,5";\n';
        dotStr += "node [shape = doublecircle]; " + user_input.finalStates + ";\n";
        dotStr += "node [shape = point]; INITIAL_STATE\n";
        dotStr += "node [shape = circle];\n";
        dotStr += "INITIAL_STATE -> " + user_input.initialState + ";\n";

        for (let transition of user_input.transitions)
            dotStr +=
                "" +
                transition.state +
                " -> " +
                transition.nextStates +
                " [label=" +
                transition.symbol +
                "];\n";

        dotStr += "}";

        console.log(dotStr);
        d3.select("#current-nfa").graphviz().zoom(false).renderDot(dotStr);

    })
})


import

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
    let removeButton = $(".remove-button");
    let transmissionInput = $(".production-row input");
    let initialStateInput = $("#initialStateInput");
    let finalStateInput = $("#finalStatesInput");

    $("#new-transition").click(function () {
        let transitionsDiv = $("#nfa-transitions");
        let elementClone = $("#nfa-transitions .production-row").last().clone(true);

        elementClone.appendTo(transitionsDiv);

        $(".remove-button").show();
    });


    removeButton.click(function () {
        let parent = $(this).parent();
        let grandparent = parent.parent();

        if (grandparent.children().length <= 2) {
            removeButton.hide();
        }

        parent.remove();
    });


    transmissionInput.on("keypress", function (e) {
        if (e.which === 13) {
            $("new-transition").click();
        }
    });

    transmissionInput.on("keyup", function (e) {
        if (e.which !== 13) {
            $("#verify-update-debug").click();
        }
    });

    initialStateInput.on("keyup", function (e) {
        $("#verify-update-debug").click();
    });

    finalStateInput.on("keyup", function (e) {
        $("#verify-update-debug").click();
    });


})


"use strict";
function getSelections(node) {
    return node.selectionSet.selections.map(function (selection) {
        return selection.name.value;
    });
}
exports.getSelections = getSelections;

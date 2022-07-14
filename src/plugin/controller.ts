import {postMessage} from "./postMessage";
import {fillCards, fillImages} from "./fill";

function main() {
    figma.showUI(__html__, {width: 240, height: 320});

    // every time a number of frames/instances are selected, store that number in a constant
    // and send that number to the iframe
    postMessage("size", [], figma.currentPage.selection.length);

    figma.on("selectionchange", () => {
        postMessage("size", [], figma.currentPage.selection.length);
    });

    figma.ui.onmessage = (message) => {
        if (message.type === "get-results") {
            let data = JSON.parse(message.payload);
            fillCards(data);
        }
        if (message.type === "imgData") {
            fillImages(message);
        }
    };
}

main();

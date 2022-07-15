import {postMessage} from "./postMessage";
import {populateCards, populateImages} from "./populate";

function main() {
    figma.showUI(__html__, {width: 240, height: 320});

    // every time a number of frames/instances are selected, store that number in a constant
    // and send that number to the iframe
    // @ts-ignore
    postMessage("size", [], figma.currentPage.selection.length);

    figma.on("selectionchange", () => {
        // @ts-ignore
        postMessage("size", [], figma.currentPage.selection.length);
    });

    figma.ui.onmessage = async (message) => {
        if (message.type === "get-results") {
            let data = JSON.parse(message.payload);
            await populateCards(data);
        }
        if (message.type === "imgData") {
            await populateImages(message, figma.currentPage.selection.length);
        }
    };
}

main();

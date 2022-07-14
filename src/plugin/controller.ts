import {postMessage} from "./postMessage";

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
            let body = JSON.parse(message.payload);
            fillCards(body);
        }
        if (message.type === "imgData") {
            const target = figma.currentPage.findOne((node) => node.id === message.targetID);
            const imageHash = figma.createImage(message.data).hash;
            const newFill = {
                type: "IMAGE",
                opacity: 1,
                blendMode: "NORMAL",
                scaleMode: "FILL",
                imageHash
            };
            target["fills"] = [newFill];
        }
    };
}

async function fillCards(data) {
    const items = data.response.searchResultPage.products.main.items;

    try {
        let nodes = figma.currentPage.selection;

        if (nodes.length === 0) {
            alert("No Layers Selected");
            return;
        }

        let matchingTextNodes = [];
        let matchingFrameNodes = [];
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            let item = items[i].product;

            // @ts-ignore
            if (node.children) {
                // @ts-ignore
                let children = loopChildTextNodes(node.children, item);
                if (children.length) {
                    matchingTextNodes = [...matchingTextNodes, ...children];
                }
                // @ts-ignore
                let frameChildren = loopChildFrameNodes(node.children, item);
                if (frameChildren.length) {
                    matchingFrameNodes = [...matchingFrameNodes, ...frameChildren];
                }
            }
        }

        if (matchingTextNodes.length === 0 && matchingFrameNodes.length === 0) {
            alert("No values to replace, please rename your layers starting with a '#', example #name.text");
        }

        for (let i = 0; i < matchingTextNodes.length; i++) {
            let node = matchingTextNodes[i][0];
            let row = matchingTextNodes[i][1];
            let value = gatherValue(node.name, row);
            replaceText(node, value);
        }

        for (let i = 0; i < matchingFrameNodes.length; i++) {
            let targetID = matchingFrameNodes[i][0];
            let name = matchingFrameNodes[i][1].toString();
            let row = matchingFrameNodes[i][2];
            let url = gatherValue(name, row);
            postMessage("image-url", url, targetID);
        }

        postMessage("done", [], `${nodes.length} instances are populated!`);
    } catch (error) {
        console.log(error);
        return true;
    }
}

function shouldReplaceText(node) {
    // Return TRUE when the node type == "TEXT" AND when the node name includes "#"
    // Otherwise return FALSE
    return node.type === "TEXT" && node.name.includes("#");
}

function isImage(node) {
    // Return TRUE when the node type == "FRAME" AND when the node name includes "#"
    // Otherwise return FALSE
    return node.name.includes("Image");
}

const gatherValue = (name, row) => {
    const layerName = name.replace("#", "").split(".");
    let value = layerName.reduce(function (obj, prop) {
        if (prop.includes("[") && prop.includes("]")) {
            prop = prop.replace("[").replace("]");
        }
        return obj && obj[prop] ? obj[prop] : "";
    }, row);

    // Handle specific case where we want to have two decimal numbers in the UI
    if (layerName[0] === "priceNumeral") return Number.parseFloat(value).toFixed(2);

    return value;
};

async function replaceText(node, content) {
    /**
     * Load ALL fonts in the text
     */
    let len = node.characters.length;
    for (let i = 0; i < len; i++) {
        await figma.loadFontAsync(node.getRangeFontName(i, i + 1));
    }
    /**
     * Once fonts are loaded we can change the text
     */
    node.characters = String(content);
}

function loopChildTextNodes(nodes, row) {
    let textMatches = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (shouldReplaceText(node)) {
            textMatches.push([node, row]);
        }
        if (node.children) {
            const nextTextMatches = loopChildTextNodes(node.children, row);
            textMatches = [...textMatches, ...nextTextMatches];
        }
    }
    return textMatches;
}

// Loop through child nodes, check whether their name includes "Image" and push their ids in an array
function loopChildFrameNodes(nodes, row) {
    let imageFrames = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isImage(node)) {
            imageFrames.push([node.id, node.name, row]);
        }
        if (node.children) {
            const nextImageFrames = loopChildFrameNodes(node.children, row);
            imageFrames = [...imageFrames, ...nextImageFrames];
        }
    }
    return imageFrames;
}

main();

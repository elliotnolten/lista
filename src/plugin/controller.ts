function main() {
    figma.showUI(__html__, {width: 480, height: 480});
    figma.ui.onmessage = (message) => {
        // console.log(message);
        if (message.type === "get-results") {
            let body = JSON.parse(message.payload);
            fillCards(body);
        }
        if (message.type === "imgData") {
            console.log(message.data, message.targetID);
            const target = figma.currentPage.findOne((node) => node.id === message.targetID);
            console.log(figma.createImage(message.data));
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
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            let item = items[i].product;

            // if (shouldReplaceText(node)) {
            //     matchingTextNodes.push([node, item]);
            // }

            // @ts-ignore
            if (node.children) {
                // @ts-ignore
                let children = loopChildTextNodes(node.children, item);
                if (children.length) {
                    matchingTextNodes = [...matchingTextNodes, ...children];
                }
                // @ts-ignore
                figma.ui.postMessage({
                    type: "image-url",
                    url: "https://i.dlpng.com/static/png/7259423_preview.png",
                    targetID: loopChildFrameNodes(node.children)[0]
                });
            }
        }

        if (matchingTextNodes.length === 0) {
            alert("No values to replace, please rename your layers starting with a '#', example #name.text");
        }

        for (let i = 0; i < matchingTextNodes.length; i++) {
            let node = matchingTextNodes[i][0];
            let row = matchingTextNodes[i][1];
            let value = gatherValue(node.name, row);
            replaceText(node, value);
        }
        figma.ui.postMessage({
            type: "done",
            message: `${nodes.length} instances are populated!`
        });
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

function shouldFillMainImage(node) {
    // Return TRUE when the node type == "FRAME" AND when the node name includes "#"
    // Otherwise return FALSE
    return node.type === "FRAME" && node.name.includes("Image");
}

const gatherValue = (name, row) =>
    name
        .replace("#", "")
        .split(".")
        .reduce(function (obj, prop) {
            if (prop.includes("[") && prop.includes("]")) {
                prop = prop.replace("[").replace("]");
            }
            return obj && obj[prop] ? obj[prop] : "--";
        }, row);

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

// Loop through child nodes, check whether their name includes "Image"
function loopChildFrameNodes(nodes) {
    let imageFrameIDs = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (shouldFillMainImage(node)) {
            imageFrameIDs.push(node.id);
        }
        if (node.children) {
            const nextImageFrameIDs = loopChildFrameNodes(node.children);
            imageFrameIDs = [...imageFrameIDs, ...nextImageFrameIDs];
        }
    }
    return imageFrameIDs;
}

main();

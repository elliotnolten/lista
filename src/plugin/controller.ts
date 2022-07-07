function main() {
    figma.showUI(__html__, {width: 480, height: 480});
    figma.ui.onmessage = (msg) => {
        if (msg.type == "get-results") {
            let body = JSON.parse(msg.payload);
            fillCards(body);
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

        let matchingNodes = [];
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            let item = items[i].product;
            if (shouldReplaceText(node)) {
                matchingNodes.push([node, item]);
            }
            // @ts-ignore
            if (node.children) {
                // @ts-ignore
                let children = loopChildNodes(node.children, item);
                if (children.length) {
                    matchingNodes = [...matchingNodes, ...children];
                }
            }
        }

        if (matchingNodes.length === 0) {
            alert("No values to replace, please rename your layers starting with a '#', example #name.text");
        }

        for (let i = 0; i < matchingNodes.length; i++) {
            let node = matchingNodes[i][0];
            let row = matchingNodes[i][1];
            let value = gatherValue(node.name, row);
            replaceText(node, value);
        }
    } catch (error) {
        console.log(error);
        return true;
    }
}

function shouldReplaceText(node) {
    return node.name.includes("#");
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

function loopChildNodes(nodes, row) {
    let matches = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (shouldReplaceText(node)) {
            matches.push([node, row]);
        }
        if (node.children) {
            const nextMatches = loopChildNodes(node.children, row);
            matches = [...matches, ...nextMatches];
        }
    }
    return matches;
}

main();

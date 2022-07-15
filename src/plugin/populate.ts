import {loopChildTextNodes, loopChildFrameNodes, loopChildInstanceNodes} from "./utils";
import {postMessage} from "./postMessage";
import _ from "lodash";

export async function populateCards(data) {
    const results = data.response.searchResultPage.products.main.items;

    try {
        let nodes = figma.currentPage.selection;

        if (nodes.length === 0) {
            alert("No Layers Selected");
            return;
        }

        let matchingTextNodes = [];
        let matchingFrameNodes = [];
        let matchingInstanceNodes = [];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const result = results[i].product;
            let item;
            const homeDelivery = _.find(result?.availability, (obj) => obj.type2 === "HOME_DELIVERY");
            const cashAndCarry = _.find(result?.availability, (obj) => obj.type2 === "CASH_AND_CARRY");
            const {prefix, store} = cashAndCarry;
            item = {
                ...result,
                homeDelivery: {text: homeDelivery.text, status: homeDelivery.status},
                cashAndCarry: {text: `${prefix}${store}`, status: cashAndCarry.status}
            };

            // @ts-ignore
            if (node.children) {
                // @ts-ignore
                let children = loopChildTextNodes(node.children, item);
                if (children.length) matchingTextNodes = [...matchingTextNodes, ...children];
                // @ts-ignore
                let frameChildren = loopChildFrameNodes(node.children, item);
                if (frameChildren.length) matchingFrameNodes = [...matchingFrameNodes, ...frameChildren];
                // @ts-ignore
                let instanceChildren = loopChildInstanceNodes(node.children, item);
                if (instanceChildren.length) matchingInstanceNodes = [...matchingInstanceNodes, ...instanceChildren];
            }
        }

        if (matchingTextNodes.length === 0 && matchingFrameNodes.length === 0) {
            alert("No values to replace, please rename your layers starting with a '#', example #name.text");
        }

        // Loop through text nodes and replace their text with matching data keys
        for (let i = 0; i < matchingTextNodes.length; i++) {
            let node = matchingTextNodes[i][0];
            let row = matchingTextNodes[i][1];
            let value = gatherValue(node.name, row, false);
            replaceText(node, value);
        }

        // Loop through frame nodes and post matching image urls and their node id to UI
        for (let i = 0; i < matchingFrameNodes.length; i++) {
            let targetID = matchingFrameNodes[i][0];
            let name = matchingFrameNodes[i][1].toString();
            let row = matchingFrameNodes[i][2];
            let url = gatherValue(name, row, false);
            postMessage("image-url", url, targetID);
        }

        // Loop through instance nodes and change component properties
        for (let i = 0; i < matchingInstanceNodes.length; i++) {
            let node = matchingInstanceNodes[i][0];
            let componentProps = node.componentProperties;
            // let variantProp = _.find(componentProps, obj => obj.type === "VARIANT")
            let name = matchingInstanceNodes[i][1];
            let row = matchingInstanceNodes[i][2];
            let variantValue = gatherValue(name, row, false);
            let componentKey = gatherValue(name, componentProps, true);
            // Find a layername that matches the variantProp (status)
            // and change that prop to the variant name's value
            node.setProperties({[componentKey]: variantValue});
        }
    } catch (error) {
        console.log(error);
        return true;
    }
}

export function populateImages(message, nodesLength) {
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
    figma.notify(`${nodesLength} instance(s) are populated!`);
}

const gatherValue = (name, row, onlyProp) => {
    const layerName = name.replace("#", "").split(".");
    let value = layerName.reduce(function (obj, prop) {
        if (prop.includes("[") && prop.includes("]")) {
            prop = prop.replace("[").replace("]");
        }
        if (onlyProp) return prop;
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

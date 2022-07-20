import {loopChildTextNodes, loopChildFrameNodes, loopChildInstanceNodes} from "./utils";
import {postMessage} from "./postMessage";
import _ from "lodash";

export async function populateCards(data) {
    const results = data.response.searchResultPage.products.main.items;

    try {
        let nodes = figma.currentPage.selection;
        let nodesLength = nodes.length;
        if (nodesLength > results.length) nodesLength = results.length;

        if (nodes.length === 0) {
            alert("No Layers Selected");
            return;
        }

        let matchingTextNodes = [];
        let matchingFrameNodes = [];
        let matchingInstanceNodes = [];
        for (let i = 0; i < nodesLength; i++) {
            const node = nodes[i];

            // Only read property 'product' if results[i] is not undefined, otherwise return empty object
            let result;
            if (results[i] !== undefined) {
                result = results[i].product;
            }

            let item;

            // Extra data points for onlineSellable products
            let homeDelivery = {};
            let cashAndCarry = {};
            let quickFact1 = {};
            let quickFact2 = {};

            // If item is onlineSellable
            if (result.onlineSellable) {
                // Objects for availability info
                const homeDeliveryObj = _.find(result?.availability, (obj) => obj.type2 === "HOME_DELIVERY");
                const cashAndCarryObj = _.find(result?.availability, (obj) => obj.type2 === "CASH_AND_CARRY");
                const {status, prefix, store, suffix} = cashAndCarryObj;

                homeDelivery = {text: homeDeliveryObj.text, status: homeDeliveryObj.status};
                cashAndCarry = {text: `${prefix}${store}${suffix}`, status};

                // Objects for quick facts
                quickFact1 = result?.quickFacts[0];
                quickFact2 = result?.quickFacts[1];
            }

            // If there's no contextualImage, fallback to main image
            if (result.contextualImageUrl === undefined) result.contextualImageUrl = result.mainImageUrl;

            item = {
                ...result,
                homeDelivery,
                cashAndCarry,
                quickFact1,
                quickFact2
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
            let componentProperties = node.componentProperties;
            let name = matchingInstanceNodes[i][1];
            let row = matchingInstanceNodes[i][2];
            let variantValue = gatherValue(name, row, false);
            let componentProp = gatherValue(name, componentProperties, true);

            // If variantvalue is empty, hide node
            if (variantValue === "") {
                node.visible = false;
                // Else, find a layername that matches the variantProp
                // and change that prop to the variant name's value
            } else {
                node.setProperties({[componentProp]: variantValue});
            }
        }
    } catch (error) {
        console.log(error);
        return true;
    }
}

export function populateImages(message) {
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

    figma.notify(`✅ Your designs are populated!`, {timeout: 1000});
    postMessage("done", {}, `✅ Your designs are populated!`);
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

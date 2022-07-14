// Utils
// Functions that loop through selected nodes and child nodes

function shouldReplaceText(node) {
    // Return TRUE when the node type == "TEXT" AND when the node name includes "#"
    // Otherwise return FALSE
    return node.type === "TEXT" && node.name.includes("#");
}

function isImage(node) {
    // Return TRUE when the node type == "FRAME" AND when the node name includes "#"
    // Otherwise return FALSE
    if (node.type === "INSTANCE" && (node.name.includes("#homeDelivery") || node.name.includes("#cashAndCarry")))
        console.log(node);
    return node.name.includes("Image");
}

export function loopChildTextNodes(nodes, row) {
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
export function loopChildFrameNodes(nodes, row) {
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

// Utils
// Functions that loop through selected nodes and child nodes

function isText(node) {
    // Return TRUE when the node type == "TEXT" AND when the node name includes "#"
    // Otherwise return FALSE
    return node.type === "TEXT" && node.name.includes("#") && node.visible && node.parent.visible;
}

function isImage(node) {
    // Return TRUE when the node type == "FRAME" AND when the node name includes "#"
    // Otherwise return FALSE
    return node.name.includes("Image") && node.name.includes("#") && node.visible && node.parent.visible;
}

function isInstance(node) {
    return (
        node.type === "INSTANCE" &&
        node.name.includes("#") &&
        !node.name.includes("Image") &&
        node.visible &&
        node.parent.visible
    );
}

export function loopChildTextNodes(nodes, row) {
    let textMatches = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isText(node)) {
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

// Loop through instance nodes
export function loopChildInstanceNodes(nodes, row) {
    let instances = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isInstance(node)) instances.push([node, node.name, row]);
        if (node.children) {
            const nextInstances = loopChildInstanceNodes(node.children, row);
            instances = [...instances, ...nextInstances];
        }
    }
    return instances;
}

export function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

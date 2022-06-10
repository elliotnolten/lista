figma.showUI(__html__);
// figma.ui.postMessage({type: "networkRequest"})

figma.ui.onmessage = async (msg) => {
    const nodes: SceneNode[] = [];

    if (msg.type === "get-data") {
        const itemComponentSet = figma.currentPage.selection[0] as ComponentNode;

        const imageHash = figma.createImage(msg.mainImages[0]).hash;
        console.log(imageHash);

        for (let i = 0; i < msg.items.length; i++) {
            const newItem = itemComponentSet.createInstance();
            const itemName = newItem.findOne((node) => node.name == "name" && node.type == "TEXT") as TextNode;
            await figma.loadFontAsync(itemName.fontName as FontName);
            itemName.characters = msg.items[i]?.product?.name;
            // console.log(msg.mainImages[i])

            newItem.x = i * 400;

            nodes.push(newItem);
        }

        figma.viewport.scrollAndZoomIntoView(nodes);

        // This is how figma responds back to the ui
        // figma.ui.postMessage({type: "get-data", query: msg.query})
    }

    if (msg.type == "cancel") {
        figma.closePlugin();
    }
};

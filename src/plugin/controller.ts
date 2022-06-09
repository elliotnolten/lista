figma.showUI(__html__);
// figma.ui.postMessage({type: "networkRequest"})

figma.ui.onmessage = (msg) => {
    if (msg.type === "get-data") {
        const itemComponentSet = figma.currentPage.selection[0] as ComponentNode;

        const nodes: SceneNode[] = [];

        msg.items.map((item, index) => {
            console.log(item, index);
            const newItem = itemComponentSet.createInstance();
            newItem.x = index * 300;
            nodes.push(newItem);
        });

        // for (let i = 0; i < 4; i++) {
        //     const rect = figma.createRectangle();
        //     rect.x = i * 150;
        //     rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
        //     figma.currentPage.appendChild(rect);
        //     nodes.push(rect);
        // }

        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);

        // This is how figma responds back to the ui
        // figma.ui.postMessage({type: "get-data", query: msg.query})
    }

    figma.closePlugin();
};

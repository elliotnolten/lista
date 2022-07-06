function main() {
    figma.showUI(__html__, {width: 480, height: 480});
    figma.ui.onmessage = (msg) => {
        console.log(msg);
    };
}

main();

// postmessage
// Helper function to post message to the iframe
export function postMessage(type, payload, message) {
    figma.ui.postMessage({type, payload, message});
}

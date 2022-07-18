// postmessage
// Helper function to post message to the iframe
export function postMessage(type: string, payload: any, message: any) {
    figma.ui.postMessage({type, payload, message});
}

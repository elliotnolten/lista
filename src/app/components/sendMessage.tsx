export const sendMessage = (type: string, payload: any, message: string) => {
    parent.postMessage(
        {
            pluginMessage: {
                type,
                message,
                payload: JSON.stringify(payload)
            }
        },
        "*"
    );
};

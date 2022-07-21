export const sendMessage = (type: string, payload: any, message: any) => {
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

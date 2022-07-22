import * as imageConvert from "image-conversion";

export function fetchSIKApi(endpoint) {
    return new Promise(async (resolve, reject) => {
        fetch(endpoint)
            .then((res) => res.json())
            .then(async (response) => {
                resolve(response);
            })
            .catch((error) => reject(error));
    });
}

export async function fetchImageFromURL(url, targetID) {
    const proxyServer = "https://secure-thicket-88117.herokuapp.com";
    const proxyUrl = `${proxyServer}/${url}`;
    let data = await fetch(proxyUrl).then((response) => {
        try {
            return response;
        } catch (error) {
            return error;
        }
    });
    // IKEA images are webp, convert to jpeg
    let blob = await data.blob();

    const image = new Image();
    image.src = proxyUrl;
    image.crossOrigin = "anonymous";
    await image.decode();

    const canvas = await imageConvert.imagetoCanvas(image);

    const jpeg = new Image();
    jpeg.src = canvas.toDataURL("image/jpeg");
    await jpeg.decode();

    data = await fetch(jpeg.src);
    blob = await data.blob();

    const buffer = await blob["arrayBuffer"]();
    const uint8 = new Uint8Array(buffer);

    parent.postMessage(
        {
            pluginMessage: {
                type: "imgData",
                data: uint8,
                targetID
            }
        },
        "*"
    );
}

import * as React from "react";
import * as imageConvert from "image-conversion";
import {Button, Input} from "react-figma-ui";

export const Search = () => {
    const [loading, setLoading] = React.useState(false);
    const [query, setQuery] = React.useState("Billy");
    const [size, setSize] = React.useState(0);
    const [endpoint, setEndpoint] = React.useState("https://sik.search.blue.cdtapps.com/nl/en/search-result-page");

    // Listen to plugin messages
    const MessageListener = (event) => {
        const {type, url, targetID, size} = event.data.pluginMessage;
        const imageUrl = url;
        if (type === "image-url") {
            fetchImageFromURL(`${imageUrl}?f=xxs`, targetID);
        }
        if (type == "size") {
            setSize(size);
        }
    };

    React.useEffect(() => {
        window.addEventListener("message", MessageListener);

        return () => {
            window.removeEventListener("message", MessageListener);
        };
    }, []);

    React.useEffect(() => {
        console.log(endpoint);
        setEndpoint(
            `https://sik.search.blue.cdtapps.com/nl/en/search-result-page?q=${query}&size=${size + 1}&types=PRODUCT`
        );
    }, [query, size]);

    const handleSearchChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let response = await fetchSIKApi(endpoint);
            setLoading(false);
            sendJsonMessage("get-results", {response});
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const sendJsonMessage = (type: string, payload: any) => {
        parent.postMessage(
            {
                pluginMessage: {
                    type,
                    name: `name_${type}`,
                    payload: JSON.stringify(payload)
                }
            },
            "*"
        );
    };

    function fetchSIKApi(endpoint) {
        return new Promise(async (resolve, reject) => {
            fetch(endpoint)
                .then((res) => res.json())
                .then(async (response) => {
                    resolve(response);
                })
                .catch((error) => reject(error));
        });
    }

    async function fetchImageFromURL(url, targetID) {
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

    return (
        <div>
            <Input
                value={query}
                onChange={handleSearchChange}
                placeholder="What are you looking for?"
                iconProps={{iconName: "search"}}
            />
            <p>
                <Button onClick={handleSubmit} tint="primary">
                    {loading ? "Loading..." : "Submit"}
                </Button>
            </p>
        </div>
    );
};

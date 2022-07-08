import * as React from "react";

// interface SIKApi {
//     status: string;
//     response: Response;
// }

export const Search = () => {
    const [loading, setLoading] = React.useState(false);
    const [query, setQuery] = React.useState("billy");
    const [size, setSize] = React.useState(2);
    const [endpoint, setEndpoint] = React.useState("https://sik.search.blue.cdtapps.com/nl/en/search-result-page");

    // Listen to plugin messages
    const MessageListener = (event) => {
        const {type, url, targetID} = event.data.pluginMessage;
        if (type === "image-url") {
            console.log(url, targetID);
            fetchImageFromURL(url, targetID);
        }
    };

    React.useEffect(() => {
        window.addEventListener("message", MessageListener);

        return () => {
            window.removeEventListener("message", MessageListener);
        };
    }, []);

    React.useEffect(() => {
        setEndpoint(
            `https://sik.search.blue.cdtapps.com/nl/en/search-result-page?q=${query}&size=${size}&types=PRODUCT`
        );
    }, [query, size]);

    const handleSearchChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSizeChange = (event) => {
        setSize(event.target.value);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let response = await fetchSIKApi(endpoint);
            setLoading(false);
            sendJsonMessage("get-results", {response});
            // getImages(response);
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

    // function getImages(data) {
    //     const images = [];
    //     data?.searchResultPage?.products?.main?.items.map((item) => {
    //         images.push({url: item?.product?.mainImageUrl, id: item.product?.id});
    //     });
    //     for (let i = 0; i < images.length; i++) {
    //         fetchImageFromURL(images[i].url, images[i].id);
    //     }
    // }

    async function fetchImageFromURL(url, targetID) {
        const proxyServer = "https://secure-thicket-88117.herokuapp.com";
        await fetch(`${proxyServer}/${url}`)
            .then((response) => {
                try {
                    return response.arrayBuffer();
                } catch (error) {
                    console.error(error);
                }
            })
            .then((array) => {
                parent.postMessage(
                    {
                        pluginMessage: {
                            type: "imgData",
                            data: new Uint8Array(array),
                            targetID
                        }
                    },
                    "*"
                );
            });
    }

    return (
        <div>
            <div className="input input--with-icon">
                <div className="icon icon--search" />
                <input
                    type="search"
                    className="input__field"
                    placeholder="What are you looking for?"
                    onChange={handleSearchChange}
                    value={query}
                />
            </div>
            <div className="input">
                <label>How many products?</label>
                <input type="number" width="100px" className="input__field" onChange={handleSizeChange} value={size} />
            </div>
            <p>
                <button type="submit" onClick={handleSubmit} className="button button--primary">
                    {loading ? "Loading..." : "Submit"}
                </button>
            </p>
        </div>
    );
};

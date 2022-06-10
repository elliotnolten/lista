import * as React from "react";
import "../styles/ui.css";

declare function require(path: string): any;

const App = ({}) => {
    const textbox = React.useRef<HTMLInputElement>(undefined);

    const queryRef = React.useCallback((element: HTMLInputElement) => {
        if (element) element.value = "sofa";
        textbox.current = element;
    }, []);

    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log(result?.searchResultPage?.products?.main?.items);
            return result?.searchResultPage?.products?.main?.items;
        } catch (err) {
            console.log(err);
        }
    };

    const fetchImagefromURL = async (url) => {
        await fetch(`https://secure-thicket-88117.herokuapp.com/${url}`)
            .then((r) => {
                try {
                    return r.arrayBuffer();
                } catch (error) {
                    console.error(error);
                }
            })
            .then((a) => {
                return new Uint8Array(a);
            });
    };

    const onCreate = async () => {
        const query = textbox.current.value;
        const items = await fetchData(
            `https://sik.search.blue.cdtapps.com/nl/en/search-result-page?q=${query}&size=4&types=PRODUCT`
        );

        const mainImages = [];

        items.map((item, index) => {
            console.log(item?.product?.mainImageUrl, index);
            mainImages.push(fetchImagefromURL(item?.product?.mainImageUrl));
        });

        parent.postMessage({pluginMessage: {type: "get-data", items, mainImages}}, "*");
    };

    const onCancel = () => {
        parent.postMessage({pluginMessage: {type: "cancel"}}, "*");
    };

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {type, query} = event.data.pluginMessage;
            console.log(type, query);
        };
    }, []);

    return (
        <div>
            <img src={require("../assets/logo.svg")} />
            <p>
                Count: <input ref={queryRef} />
            </p>
            <button id="create" onClick={onCreate}>
                Create
            </button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default App;

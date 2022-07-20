import * as React from "react";
import {Button, Input, Select} from "react-figma-plugin-ds";
import {fetchImageFromURL, fetchSIKApi} from "./Fetch";
import {sendMessage} from "./SendMessage";
import {languages} from "./languages";

export const Search = () => {
    const [loading, setLoading] = React.useState(false);
    const [query, setQuery] = React.useState("Billy");
    const [size, setSize] = React.useState(0);
    const [lang, setLang] = React.useState(languages[0]);
    const [endpoint, setEndpoint] = React.useState("https://sik.search.blue.cdtapps.com/gb/en/search-result-page");
    const [done, setDone] = React.useState(false);
    const [message, setMessage] = React.useState("");

    // Listen to plugin messages
    const MessageListener = (event) => {
        const {type, payload, message} = event.data.pluginMessage;
        if (type == "image-url") fetchImageFromURL(`${payload}?f=xxs`, message);
        if (type == "size") setSize(message);
        if (type == "done") {
            setTimeout(() => {
                setDone(true);
                setMessage(message);
                setLoading(false);
            }, 2000);
        }
    };

    React.useEffect(() => {
        window.addEventListener("message", MessageListener);

        return () => {
            window.removeEventListener("message", MessageListener);
        };
    }, []);

    React.useEffect(() => {
        // params dependent on selected language
        const {value, store, zip} = lang;

        // All params
        const params = {
            q: query,
            store,
            zip,
            size: size + 1,
            types: "PRODUCT"
        };

        const queryString = Object.keys(params)
            .map((key) => {
                if (params[key]) return `${key}=${params[key]}`;
            })
            .join("&");

        console.log(`https://sik.search.blue.cdtapps.com/${value}search-result-page?${queryString}`);

        setEndpoint(`https://sik.search.blue.cdtapps.com/${value}search-result-page?${queryString}`);
    }, [query, size, lang]);

    const handleSubmit = async () => {
        setLoading(true);
        setDone(false);
        try {
            let response = await fetchSIKApi(endpoint);
            setLoading(false);
            // @ts-ignore
            sendMessage("get-results", {response}, response.searchResultPage.products.badge);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <Input
                // value={query}
                defaultValue={query}
                onChange={(value) => setQuery(value)}
                placeholder="What are you looking for?"
                // iconProps={{iconName: "search"}}
                icon="Search"
                // disabled={!done && loading}
                isDisabled={!done && loading}
            />
            <Select
                defaultValue={lang.value}
                options={languages}
                onChange={(value) => setLang(value)}
                isDisabled={!done && loading}
            />
            <p>
                <Button onClick={handleSubmit} tint="primary" disabled={!done && loading}>
                    {loading ? "Loading..." : "Submit"}
                </Button>
            </p>
            {!done && loading && <p className="type type--small">...loading</p>}
            {done && !loading && (
                <ul className="type type--small">
                    <li>{message}</li>
                    <li>
                        📚 Checkout the endpoint here:{" "}
                        <a href={endpoint} target="_blank">
                            SIK API
                        </a>
                        .
                    </li>
                </ul>
            )}
        </div>
    );
};

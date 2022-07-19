import * as React from "react";
import {Button, Input} from "react-figma-ui";
import {fetchImageFromURL, fetchSIKApi} from "./Fetch";
import {sendMessage} from "./SendMessage";

const languages = {
    gbEN: {
        lang: "gb/en/",
        store: "262",
        zip: "RM20 3WJ"
    }
};

export const Search = () => {
    const [loading, setLoading] = React.useState(false);
    const [query, setQuery] = React.useState("Billy");
    const [size, setSize] = React.useState(0);
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
        const selectedLang = "gbEN";
        const {lang, store, zip} = languages[selectedLang];
        setEndpoint(
            `https://sik.search.blue.cdtapps.com/${lang}search-result-page?q=${query}&size=${
                size + 1
            }&types=PRODUCT&zip=${zip}&store=${store}`
        );
    }, [query, size]);

    const handleSearchChange = (event) => {
        setQuery(event.target.value);
    };

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
                value={query}
                onChange={handleSearchChange}
                placeholder="What are you looking for?"
                iconProps={{iconName: "search"}}
                disabled={!done && loading}
            />
            <p>
                <Button onClick={handleSubmit} tint="primary" disabled={!done && loading}>
                    {loading ? "Loading..." : "Submit"}
                </Button>
            </p>
            {!done && loading && <p>...loading</p>}
            {done && !loading && (
                <ul>
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

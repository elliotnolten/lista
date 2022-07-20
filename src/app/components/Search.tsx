import * as React from "react";
// import {Button, Input, SelectMenu, SelectMenuOption} from "react-figma-ui";
import {Button, Input, Select} from "react-figma-plugin-ds";
import {fetchImageFromURL, fetchSIKApi} from "./Fetch";
import {sendMessage} from "./SendMessage";
import _ from "lodash";

const languages = [
    {
        label: "🇬🇧 GB-EN",
        value: "gb/en/",
        store: "262",
        zip: "RM20 3WJ"
    },
    {
        label: "🇳🇱 NL-NL",
        value: "nl/nl/",
        store: "088",
        zip: "1019 GM"
    }
];

export const Search = () => {
    const [loading, setLoading] = React.useState(false);
    const [query, setQuery] = React.useState("");
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
        const selectedLang = _.find(languages, (obj) => obj.value === lang.value);
        const {store, zip, value} = selectedLang;
        const newSize = size + 1;
        let params = {
            q: query,
            size: newSize,
            types: "PRODUCT",
            zip,
            store
        };

        const queryString = Object.keys(params)
            .map((key) => {
                console.log(key, params[key]);
                const value = encodeURIComponent(params[key]);
                if (params[key]) return `${key}=${value}`;
            })
            .join("&");

        setEndpoint(`https://sik.search.blue.cdtapps.com/${value}search-result-page?q=${queryString}`);
    }, [query, size]);

    const handleSubmit = async () => {
        setLoading(true);
        setDone(false);
        try {
            let response = await fetchSIKApi(endpoint);
            setLoading(false);
            sendMessage("get-results", {response}, "");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <Input
                defaultValue={query}
                onChange={(value) => setQuery(value)}
                placeholder="What are you looking for?"
                icon="search"
                isDisabled={!done && loading}
            />
            <Select defaultValue={lang.value} options={languages} onChange={(value) => setLang(value)} />
            <p>
                <Button onClick={handleSubmit} tint="primary" disabled={!done && loading}>
                    {loading ? "Loading..." : "Submit"}
                </Button>
            </p>
            {!done && loading && <p>...loading</p>}
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

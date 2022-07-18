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

    // Listen to plugin messages
    const MessageListener = (event) => {
        const {type, payload, message} = event.data.pluginMessage;
        if (type === "image-url") fetchImageFromURL(`${payload}?f=xxs`, message);
        if (type == "size") setSize(message);
    };

    React.useEffect(() => {
        window.addEventListener("message", MessageListener);

        return () => {
            window.removeEventListener("message", MessageListener);
        };
    }, []);

    React.useEffect(() => {
        console.log(endpoint);
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
        try {
            let response = await fetchSIKApi(endpoint);
            setLoading(false);
            sendMessage("get-results", {response}, "");
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

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

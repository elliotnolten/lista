import * as React from "react";
import {Button, Input, Select, Icon} from "react-figma-plugin-ds";
import {fetchImageFromURL, fetchSIKApi} from "../utils/Fetch";
import {sendMessage} from "../utils/sendMessage";
import {languages} from "../data/languages";
import {sortOrders} from "../data/sortOrders";

export const Search = () => {
    const [loading, setLoading] = React.useState(false);
    const [query, setQuery] = React.useState("Billy");
    const [size, setSize] = React.useState(0);
    const [lang, setLang] = React.useState(languages[0]);
    const [sortOrder, setSortOrder] = React.useState(sortOrders[0]);
    const [endpoint, setEndpoint] = React.useState("https://sik.search.blue.cdtapps.com/gb/en/search-result-page");
    const [done, setDone] = React.useState(false);
    const [message, setMessage] = React.useState("");

    // Listen to plugin messages
    const MessageListener = (event) => {
        const {type, payload, message} = event.data.pluginMessage;
        if (type == "image-url") fetchImageFromURL(`${payload}?f=xxs`, message);
        if (type == "size") setSize(message);
        if (type == "done") {
            setMessage(message);
            setDone(true);
            setLoading(false);
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
        const sort = sortOrder.value;

        // All params
        const params = {
            q: query,
            store,
            zip,
            size: size + 1,
            types: "PRODUCT",
            sort
        };

        const queryString = Object.keys(params)
            .map((key) => {
                if (params[key]) return `${key}=${encodeURI(params[key])}`;
            })
            .join("&");

        console.log(`https://sik.search.blue.cdtapps.com/${value}search-result-page?${queryString}`);

        setEndpoint(`https://sik.search.blue.cdtapps.com/${value}search-result-page?${queryString}`);
    }, [query, size, lang, sortOrder]);

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
        <div className="form-fields">
            <Input
                // value={query}
                defaultValue={query}
                onChange={(value) => setQuery(value)}
                placeholder="What are you looking for?"
                icon="Search"
                iconColor="black"
                isDisabled={!done && loading}
            />
            <div className="selects">
                <Select
                    className="select"
                    defaultValue={lang.value}
                    options={languages}
                    onChange={(value) => setLang(value)}
                    isDisabled={!done && loading}
                />
                <div className="select">
                    <Icon className="icon" color="black8" name="up-down" onClick={null} string="Sort order" />
                    <Select
                        className="sort-order"
                        defaultValue={sortOrder.value}
                        options={sortOrders}
                        onChange={(value) => setSortOrder(value)}
                        isDisabled={!done && loading}
                    />
                </div>
            </div>
            <p>
                <Button onClick={handleSubmit} tint="primary" disabled={!done && loading}>
                    {loading ? "Loading..." : "Submit"}
                </Button>
            </p>
            {!done && loading && (
                <div className="spinner-container">
                    <span className="loader"></span>
                </div>
            )}
            {done && !loading && (
                <ul className="type type--small messages">
                    <li>
                        <Icon className="icon" color="black8" name="check" onClick={null} string="Success" />
                        {message}
                    </li>
                    <li>
                        <Icon className="icon" color="black8" name="library" onClick={null} string="API" />{" "}
                        <span>
                            Checkout the endpoint here:{" "}
                            <a href={endpoint} target="_blank">
                                SIK API
                            </a>
                            .
                        </span>
                    </li>
                </ul>
            )}
        </div>
    );
};

import * as React from "react";

// interface SIKApi {
//     status: string;
//     response: Response;
// }

export const Search = () => {
    const [loading, setLoading] = React.useState(false);
    const [query, setQuery] = React.useState("");

    const handleSearchChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSubmit = async () => {
        const SIKApiEndpoint = `https://sik.search.blue.cdtapps.com/nl/en/search-result-page?q=${query}&size=8&types=PRODUCT`;
        setLoading(true);
        try {
            let response = await fetchSIKApi(SIKApiEndpoint);
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

    console.log(loading);

    return (
        <div>
            <div className="input input--with-icon">
                <div className="icon icon--search" />
                <input
                    type="search"
                    className="input__field"
                    placeholder="What are you looking for?"
                    onChange={handleSearchChange}
                />
            </div>
            <p>
                <button type="submit" onClick={handleSubmit} className="button button--primary">
                    {loading ? "Loading..." : "Submit"}
                </button>
            </p>
        </div>
    );
};

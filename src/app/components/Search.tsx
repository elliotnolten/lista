import * as React from "react";

// interface SIKApi {
//     status: string;
//     response: Response;
// }

export const Search = () => {
    const [loading, setLoading] = React.useState(false);
    // const [results, setResults] = React.useState([]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let response = await fetchSIKApi();
            setLoading(false);
            sendJsonMessage("test", {response});
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

    const SIKApiEndpoint = "https://sik.search.blue.cdtapps.com/nl/en/search-result-page?q=sofa&size=8&types=PRODUCT";
    // const NYTEndpoint =
    // "https://api.nytimes.com/svc/search/v2/articlesearch.json?q=election&api-key=6e05q6EpTOjDTFY2i8JqZzGAFw2uSoM3";

    function fetchSIKApi() {
        return new Promise(async (resolve, reject) => {
            fetch(SIKApiEndpoint)
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
            <h3>Search</h3>
            <input type="search" />
            <button type="submit" onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
};

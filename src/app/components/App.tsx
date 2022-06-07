import * as React from "react";
import "../styles/ui.css";

declare function require(path: string): any;

const App = ({}) => {
    const textbox = React.useRef<HTMLInputElement>(undefined);

    const queryRef = React.useCallback((element: HTMLInputElement) => {
        if (element) element.value = "sofa";
        textbox.current = element;
    }, []);

    const onCreate = () => {
        const query = textbox.current.value;
        console.log(query);
        parent.postMessage({pluginMessage: {type: "get-data", query}}, "*");
    };

    const onCancel = () => {
        parent.postMessage({pluginMessage: {type: "cancel"}}, "*");
    };

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = (event) => {
            const {type, message} = event.data.pluginMessage;
            console.log(event);
            if (type === "get-data") {
                console.log(message);
            }
        };
    }, []);

    return (
        <div>
            <img src={require("../assets/logo.svg")} />
            <h2>Rectangle Creator</h2>
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

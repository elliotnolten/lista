import * as React from "react";
import "../styles/ui.css";
import {Search} from "./Search";

declare function require(path: string): any;

const App = ({}) => {
    return (
        <div>
            <img src={require("../assets/logo.svg")} />
            <p>Add real IKEA products to your designs.</p>
            <Search />
        </div>
    );
};

export default App;

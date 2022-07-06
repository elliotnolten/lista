import * as React from "react";
import "../styles/ui.css";
import {Search} from "./Search";

declare function require(path: string): any;

const App = ({}) => {
    return (
        <div>
            <img src={require("../assets/logo.svg")} />
            <h2>Find IKEA products</h2>
            <Search />
        </div>
    );
};

export default App;

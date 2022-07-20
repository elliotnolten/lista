import * as React from "react";
import "../styles/ui.css";
import {Search} from "./Search";

declare function require(path: string): any;

const App = ({}) => {
    return (
        <div>
            <img src={require("../assets/logo.svg")} />
            <Search />
        </div>
    );
};

export default App;

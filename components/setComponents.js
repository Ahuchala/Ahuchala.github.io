import { header } from "./header.js";

const components = {
    "#header": header
};

export function setComponents() {
    for (const [queryString, getHTML] of Object.entries(components)) {
        document.querySelector(queryString).innerHTML = getHTML();
    }
}
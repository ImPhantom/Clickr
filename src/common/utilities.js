class Utilities {
    setVisibility(htmlElement, visible) {
        (visible) ? htmlElement.css({"display": "flex", "visibility": "visible"}) : htmlElement.css({"display": "none", "visibility": "hidden"});
    }
}
module.exports = new Utilities();
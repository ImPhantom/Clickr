import "../static/stylesheet.css";
import * as $ from 'jquery';

import { remote } from 'electron';

$(document).ready(function () {
    const _window = remote.BrowserWindow.getFocusedWindow();
    $("#minimize-button").click(() => _window.minimize());
    $("#close-button").click(() => _window.close());
});
/* import $ from "jquery";
import "select2/dist/css/select2.min.css";  */
import {createRoot} from "react-dom/client";
import App from "./App";
/* import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; */
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

/* $(document).ready(function() {
    $('.location-select2').select2();
}); */
/* 
$(document).ready(function () {
    $('#location-select2').select2({
        placeholder: 'Välj Plats',
        allowClear: true,
        multiple: true, 
        width: '100%', 
    });
});
 */



import * as edq from './edq.js';

function main() {
    // TEST
    console.log('TEST');
    console.log(edq);
    console.log(edq.VERSION);
    console.log(edq.util.strings.cleanText('  Clean_Text  '));
}

document.addEventListener("DOMContentLoaded", main);

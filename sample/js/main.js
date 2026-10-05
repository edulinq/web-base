import * as edq from '../edq/js/edq.js';

const ICONS_URL = 'edq/images/icons.svg';

function _placeIcons(iconIDs) {
    let baseNames = new Set();
    for (const id of iconIDs) {
        baseNames.add(id.replace(/(-light)|(-dark)$/, ''));
    }

    let lines = [];
    for (const baseName of Array.from(baseNames).sort()) {
        let error = false;

        if (!iconIDs.includes(`${baseName}-light`)) {
            console.error(`Could not find lightmode icon: '${baseName}-light'.`);
            error = true;
        }

        if (!iconIDs.includes(`${baseName}-dark`)) {
            console.error(`Could not find darkmode icon: '${baseName}-dark'.`);
            error = true;
        }

        if (error) {
            continue;
        }

        lines.push(`
            <div>
                <div class="icon secondary-accent-color-bg-low">
                    <svg class="lightmode-only" role="img" aria-labelledby="icon-label-${baseName}-light">
                        <title id="icon-label-${baseName}-light">${edq.util.strings.titleCase(baseName)}</title>
                        <use href="${ICONS_URL}#${baseName}-light"></use>
                    </svg>
                    <svg class="darkmode-only" role="img" aria-labelledby="icon-label-${baseName}-dark">
                        <title id="icon-label-${baseName}-dark">${edq.util.strings.titleCase(baseName)}</title>
                        <use href="${ICONS_URL}#${baseName}-dark"></use>
                    </svg>
                </div>
                <span>${baseName.replace(/^icon-/, '')}</span>
            </div>
        `);
    }

    document.querySelector('.section-icons .container').innerHTML = lines.join('');
}

function loadIcons() {
    let frame = document.createElement('iframe');
    frame.src = ICONS_URL;
    frame.id = '_icons';
    frame.classList.add('hidden');

    frame.addEventListener("load", function() {
        let iconIDs = [];
        for (const symbol of frame.getSVGDocument().querySelectorAll('symbol')) {
            iconIDs.push(symbol.id);
        }

        _placeIcons(iconIDs);
    });

    document.querySelector('body').appendChild(frame);
}

function loadCodeBlocks() {
    let blocks = [];
    for (const [language, [extension, text]] of Object.entries(codeBlocks)) {
        let container = document.createElement('div');
        container.classList.add('code-container');
        edq.render.code.block(container, text, language, `code${extension}`);

        let label = document.createElement('p');
        label.innerText = language;

        blocks.push(label);
        blocks.push(container);
    }

    document.querySelector('div.code-blocks').replaceChildren(...blocks);
}

function loadInputFields() {
    let resultsArea = document.createElement('div');
    resultsArea.classList.add('results');

    let button = document.createElement('button');
    button.innerText = 'Submit (Parse Fields)';
    button.addEventListener('click', function(event) {
        edq.render.code.block(resultsArea, edq.util.json.pretty(inputFields.getValues()), 'json');
    });
    button.click();

    document.querySelector('div.input-fields').replaceChildren(button, inputFields.element, resultsArea);
}

function main() {
    edq.util.brightness.initBrightmode();
    edq.util.table.enableSortingAll();

    loadIcons();
    loadCodeBlocks();
    loadInputFields();
}

const codeBlocks = {
    'plaintext': ['.txt', 'This is just some text.'],
    'json': ['.json', edq.util.json.pretty({foo: 1, bar: [2.0, 3]})],
    'html': ['.html', `
<html>
    <body>
        <h1>Sample HTML!</h1>
    </body>
</html>
    `.trim()],
};

const inputFields = new edq.model.field.FieldSet([
    new edq.model.field.TextField({'name': 'normal-text', label: 'Normal Text', placeholder: 'Placeholder Text'}),
    new edq.model.field.TextField({'name': 'required-text', label: 'Required Text', required: true, placeholder: 'Required Text'}),
]);

document.addEventListener("DOMContentLoaded", main);

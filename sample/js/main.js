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

    let fieldSet = new edq.model.field.FieldSet(inputFields, {
        submitButtonText: 'Submit (Parse Fields)',
        submitButtonDisableWhenInvalid: false,
        submitCallback: function(values, _) {
            edq.render.code.block(resultsArea, edq.util.json.pretty(values), 'json');
        },
    });

    // Click the button right away to show the JSON.
    fieldSet.element.querySelector('button.submit').click();

    document.querySelector('div.input-fields').replaceChildren(fieldSet.element, resultsArea);
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

const inputFields = [
    new edq.model.field.TextField({'name': 'normal-text', label: 'Normal Text', placeholder: 'Placeholder Text'}),
    new edq.model.field.TextField({'name': 'required-text', label: 'Required Text', required: true, placeholder: 'Required Text'}),
    new edq.model.field.TextField({'name': 'default-text', label: 'Default Text', defaultValue: 'Some Default Value', placeholder: 'Default Text'}),

    new edq.model.field.NumericField({'name': 'positive-int', label: 'Positive Integer', min: 1, step: 1}),
    new edq.model.field.NumericField({'name': 'quarter-float', label: 'Float (quarters)', step: 0.25}),

    new edq.model.field.DateField({'name': 'normal-date', label: 'Normal Date'}),
    new edq.model.field.DateField({'name': 'constrained-date', label: 'Constrained Date',
        min: edq.model.timestamp.parse('2000-01-01'),
        max: edq.model.timestamp.parse('2000-01-10'),
    }),

    new edq.model.field.LocalDatetimeField({'name': 'normal-datetime', label: 'Normal Date/Time'}),

    new edq.model.field.TimeField({'name': 'normal-time', label: 'Time of Day'}),
    new edq.model.field.TimeField({'name': 'business-time', label: 'Business Hours', min: '09:00', max: '17:00'}),
];

document.addEventListener("DOMContentLoaded", main);

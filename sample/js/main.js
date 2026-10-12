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
        edq.render.code.block(container, text, language);

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
        submitButtonText: 'Submit (No Validation)',
        submitButtonDisableWhenInvalid: false,
        submitCallback: function(values, _) {
            edq.render.code.block(resultsArea, edq.util.json.pretty(values), 'json');
        },
    });

    // Click the button right away to show the JSON.
    fieldSet.element.querySelector('button.submit').click();

    // Add in an extra button for validation.
    let validateButton = document.createElement('button');
    validateButton.innerText = 'Validate (No Submit)';
    validateButton.addEventListener('click', function(event) {
        fieldSet.validateInputs();
    });
    fieldSet.element.prepend(validateButton);

    document.querySelector('div.input-fields').replaceChildren(fieldSet.element, resultsArea);
}

function loadRouting() {
    edq.core.routing.addRoute(new edq.core.routing.RegexRoute('.*', function(request) {
        let container = document.querySelector('.routing-target div');
        edq.render.code.block(container, edq.util.json.pretty(request), 'json');
    }));

    edq.core.routing.init();
    edq.core.routing.route();
}

function loadCards() {
    document.querySelector('.section-cards-link div').replaceChildren((new edq.render.cards.CardArea(linkCards)).getElement());
    document.querySelector('.section-cards-small div').replaceChildren((new edq.render.cards.CardArea(smallCards)).getElement());
    document.querySelector('.section-cards-large div').replaceChildren((new edq.render.cards.CardArea(largeCards)).getElement());
}

function main() {
    edq.util.brightness.initBrightmode();
    edq.util.table.enableSortingAll();

    loadRouting();
    loadIcons();
    loadCodeBlocks();
    loadInputFields();
    loadCards();
}

const loremIpsum = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Integer auctor aliquam neque, a feugiat velit. Nullam vel varius nulla, non faucibus massa.',
    'Ut condimentum velit vitae justo imperdiet venenatis. Curabitur quis neque iaculis, rutrum metus ac, posuere mi.',
    'Ut elit lacus, mattis eu libero id, sollicitudin scelerisque neque. Donec a accumsan urna. Maecenas sodales lectus nec sapien cursus egestas.',
];

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
    new edq.model.field.TextField({'name': 'basic-text', label: 'Basic Text', placeholder: 'Placeholder Text'}),
    new edq.model.field.TextField({'name': 'required-text', label: 'Required Text', required: true, placeholder: 'Required Text'}),
    new edq.model.field.TextField({'name': 'default-text', label: 'Default Text', defaultValue: 'Some Default Value', placeholder: 'Default Text'}),

    new edq.model.field.TextAreaField({'name': 'basic-textarea', label: 'Basic Text Area', placeholder: 'Placeholder Text'}),
    new edq.model.field.TextAreaField({'name': 'tall-textarea', label: 'Tall Text Area', rows: 10}),

    new edq.model.field.EmailField({'name': 'basic-email', label: 'Basic Email', placeholder: 'test@edulinq.org'}),

    new edq.model.field.PhoneNumberField({'name': 'basic-phone', label: 'Basic Phone'}),

    new edq.model.field.SecretField({'name': 'basic-secret', minLength: 8, label: 'Basic Secret'}),

    new edq.model.field.IntegerField({'name': 'positive-int', label: 'Positive Integer', min: 1, step: 1}),
    new edq.model.field.NumericField({'name': 'quarter-float', label: 'Float (quarters)', step: 0.25}),

    new edq.model.field.SliderField({'name': 'basic-slider', label: 'Basic Slider'}),
    new edq.model.field.SliderField({'name': 'quarter-slider', label: 'Quarter Slider', defaultValue: 0.0, min: 0.0, max: 1.0, step: 0.25}),

    new edq.model.field.DateField({'name': 'basic-date', label: 'Basic Date'}),
    new edq.model.field.DateField({'name': 'constrained-date', label: 'Constrained Date',
        min: edq.model.timestamp.parse('2000-01-01'),
        max: edq.model.timestamp.parse('2000-01-10'),
    }),

    new edq.model.field.LocalDatetimeField({'name': 'basic-datetime', label: 'Basic Date/Time'}),

    new edq.model.field.TimeField({'name': 'basic-time', label: 'Time of Day'}),
    new edq.model.field.TimeField({'name': 'business-time', label: 'Business Hours', min: '09:00', max: '17:00'}),

    new edq.model.field.RadioField({'name': 'basic-radio', label: 'Basic Radio', choices: {
        'string': 'abc',
        'int': 123,
        'float': 3.14,
        'null': null,
    }}),
    new edq.model.field.RadioField({'name': 'required-radio', label: 'Required Radio', choiceLabelBefore: true, required: true, choices: {
        'Yes': true,
        'No': false,
    }}),

    new edq.model.field.CheckboxField({'name': 'basic-checkbox', label: 'Basic Checkbox', choices: {
        'string': 'abc',
        'int': 123,
        'float': 3.14,
        'null': null,
    }}),
    new edq.model.field.CheckboxField({'name': 'required-checkbox', label: 'Required Checkbox', choiceLabelBefore: true, required: true, choices: {
        'Yes': true,
        'No': false,
    }}),

    new edq.model.field.FileField({'name': 'basic-file', label: 'Basic File'}),
    new edq.model.field.FileField({'name': 'multiple-image-file', label: 'Multiple Image Files', multiple: true, allowedTypes: 'image/*'}),
];

const linkCards = [
    new edq.render.cards.LinkCard('Some Link 1', '#cards/link?index=1'),
    new edq.render.cards.LinkCard('Some Link 2', '#cards/link?index=2'),
    new edq.render.cards.LinkCard('Some Link 3', '#cards/link?index=3'),
];

const smallCards = [
    new edq.render.cards.SmallCard('1'),
    new edq.render.cards.SmallCard('Card 2'),
    new edq.render.cards.SmallCard('Small Card 3'),
    new edq.render.cards.SmallCard('Some Small Card 4'),
];

const largeCards = [
    new edq.render.cards.LargeCard('Large Card 1', loremIpsum.slice(0, 1)),
    new edq.render.cards.LargeCard('Large Card 2', loremIpsum.slice(0, 2)),
    new edq.render.cards.LargeCard('Large Card 3', loremIpsum.slice(0, 3)),
    new edq.render.cards.LargeCard('Large Card 4', loremIpsum.slice(0, 4)),
];

document.addEventListener("DOMContentLoaded", main);

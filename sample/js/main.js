import * as edq from '../edq/js/edq.mjs';

function loadColorScheme() {
    let container = document.querySelector('.section-colorscheme');

    for (const brightmode of ['light', 'dark']) {
        let outline = (brightmode === 'light') ? 'black' : 'white';

        let brightmodeContainer = document.createElement('div');
        brightmodeContainer.classList.add('subsection', 'theme-primary');
        container.appendChild(brightmodeContainer);

        let brightmodeLabel = document.createElement('h3');
        brightmodeLabel.style.textTransform = 'capitalize';
        brightmodeLabel.textContent = `${brightmode} Mode`;
        brightmodeContainer.appendChild(brightmodeLabel);

        let contentContainer = document.createElement('div');
        brightmodeContainer.appendChild(contentContainer);

        for (const palette of ['primary', 'secondary']) {
            let subsection = document.createElement('div');
            subsection.classList.add('subsubsection', `${brightmode}mode`, `theme-${palette}`);
            subsection.style.outline = `2px solid ${outline}`;
            subsection.innerHTML = `<h4 style='text-transform: capitalize;'>${palette} Palette</h4>` + colorSchemeColorTable;
            contentContainer.appendChild(subsection);
        }

        let subsection = document.createElement('div');
        subsection.classList.add('subsubsection', `${brightmode}mode`, `theme-primary`);
        subsection.style.outline = `2px solid ${outline}`;
        subsection.innerHTML = `<h4>Elements</h4>` + colorSchemeElementTable;
        contentContainer.appendChild(subsection);
    }

}

function loadIcons() {
    let children = [];
    for (const name of edq.render.icons.getNames()) {
        let label = document.createElement('span');
        label.textContent = name;

        let iconElement = edq.render.icons.getElement(name);

        let wrapper = document.createElement('div');
        wrapper.replaceChildren(iconElement, label);

        children.push(wrapper);
    }

    document.querySelector('.section-icons .container').replaceChildren(...children);
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
    // All the routes just use the same handler (normally they would each have their own).

    edq.core.routing.addRoute(
        new edq.core.routing.BreadcrumbRoute([{label: 'Home', link: '#'}],
            new edq.core.routing.NavExactRoute(
                new edq.core.routing.StringRoute('', routeHandler),
            ),
        ),
    );

    edq.core.routing.addRoute(
        new edq.core.routing.BreadcrumbRoute([{label: 'Home', link: '#'}, {label: 'Color Scheme', link: '#nav?target=color-scheme'}],
            new edq.core.routing.NavExactRoute(
                new edq.core.routing.RegexRoute('target=color-scheme', routeHandler),
            ),
        ),
    );

    edq.core.routing.addRoute(
        new edq.core.routing.BreadcrumbRoute([{label: 'Home', link: '#'}, {label: 'Icons', link: '#nav?target=icons'}],
            new edq.core.routing.NavExactRoute(
                new edq.core.routing.RegexRoute('target=icons', routeHandler),
            ),
        ),
    );

    edq.core.routing.addRoute(
        new edq.core.routing.BreadcrumbRoute([{label: 'Home', link: '#'}, {label: 'Base Components', link: '#nav?target=base-components'}],
            new edq.core.routing.NavExactRoute(
                new edq.core.routing.RegexRoute('target=base-components', routeHandler),
            ),
        ),
    );

    edq.core.routing.addRoute(
        new edq.core.routing.BreadcrumbRoute([{label: 'Home', link: '#'}, {label: 'EduLinq Components', link: '#nav?target=edulinq-components'}],
            new edq.core.routing.NavExactRoute(
                new edq.core.routing.RegexRoute('target=edulinq-components', routeHandler),
            ),
        ),
    );

    // Fallback to the same handler for everyone else.
    edq.core.routing.setNotFound(routeHandler);

    edq.core.routing.init();
    edq.core.routing.route();
}

function routeHandler(request) {
    // Update the routing showcase section.
    let container = document.querySelector('.routing-target div');
    edq.render.code.block(container, edq.util.json.pretty(request), 'json');

    // Handle the nav bar.
    if (request.path === 'nav') {
        // Scroll to the target.
        let target = document.querySelector(`[data-nav-target="${request.params?.target}"]`);
        if (target != null) {
            target.scrollIntoView();
        }
    }
}

function loadCards() {
    document.querySelector('.section-cards-link div').replaceChildren((new edq.render.cards.CardArea(linkCards)).getElement());
    document.querySelector('.section-cards-small div').replaceChildren((new edq.render.cards.CardArea(smallCards)).getElement());
    document.querySelector('.section-cards-large div').replaceChildren((new edq.render.cards.CardArea(largeCards)).getElement());
}

function main() {
    edq.render.icons.replacePlaceholders();

    edq.util.brightness.initBrightmode();
    edq.util.table.enableSortingAll();

    loadRouting();

    loadColorScheme();
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
    new edq.render.cards.LinkCard('Some Link 1', '#cards/link?index=1', {extraClasses: ['theme-primary']}),
    new edq.render.cards.LinkCard('Some Link 2', '#cards/link?index=2', {extraClasses: ['theme-primary']}),
    new edq.render.cards.LinkCard('Some Link 3', '#cards/link?index=3', {extraClasses: ['theme-primary']}),
];

const smallCards = [
    new edq.render.cards.SmallCard('1', {extraClasses: ['theme-primary']}),
    new edq.render.cards.SmallCard('Card 2', {extraClasses: ['theme-primary']}),
    new edq.render.cards.SmallCard('Small Card 3', {extraClasses: ['theme-primary']}),
    new edq.render.cards.SmallCard('Some Small Card 4', {extraClasses: ['theme-primary']}),
];

const largeCards = [
    new edq.render.cards.LargeCard('Large Card 1', loremIpsum.slice(0, 1), {extraClasses: ['theme-primary']}),
    new edq.render.cards.LargeCard('Large Card 2', loremIpsum.slice(0, 2), {extraClasses: ['theme-primary']}),
    new edq.render.cards.LargeCard('Large Card 3', loremIpsum.slice(0, 3), {extraClasses: ['theme-primary']}),
    new edq.render.cards.LargeCard('Large Card 4', loremIpsum.slice(0, 4), {extraClasses: ['theme-primary']}),
];

const colorSchemeColorTable = `
    <table class='colorscheme standard-table' style='text-align: center;'>
        <thead>
            <tr>
                <th>Property</th>
                <th>White</th>
                <th>Black</th>
                <th>Recommended</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Background</td>
                <td style='background-color: white; color: var(--color-active-bg);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-bg);'><span>█</span></td>
                <td style='background-color: var(--color-inactive-bg); color: var(--color-active-bg);'><span>█</span></td>
            </tr>
            <tr>
                <td>Text</td>
                <td style='background-color: white; color: var(--color-active-text);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-text);'><span>█</span></td>
                <td style='background-color: var(--color-active-bg); color: var(--color-active-text);'><span>█</span></td>
            </tr>
            <tr>
                <td>Link</td>
                <td style='background-color: white; color: var(--color-active-link);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-link);'><span>█</span></td>
                <td style='background-color: var(--color-active-bg); color: var(--color-active-link);'><span>█</span></td>
            </tr>
            <tr>
                <td>Outline</td>
                <td style='background-color: white; color: var(--color-active-outline);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-outline);'><span>█</span></td>
                <td style='background-color: var(--color-inactive-bg); color: var(--color-active-outline);'><span>█</span></td>
            </tr>
            <tr>
                <td>Accent Background</td>
                <td style='background-color: white; color: var(--color-active-accent-bg);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-accent-bg);'><span>█</span></td>
                <td style='background-color: var(--color-active-bg); color: var(--color-active-accent-bg);'><span>█</span></td>
            </tr>
            <tr>
                <td>Accent Background</td>
                <td style='background-color: white; color: var(--color-active-accent-bg);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-accent-bg);'><span>█</span></td>
                <td style='background-color: var(--color-inactive-bg); color: var(--color-active-accent-bg);'><span>█</span></td>
            </tr>
            <tr>
                <td>Accent Text</td>
                <td style='background-color: white; color: var(--color-active-accent-text);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-accent-text);'><span>█</span></td>
                <td style='background-color: var(--color-active-accent-bg); color: var(--color-active-accent-text);'><span>█</span></td>
            </tr>
            <tr>
                <td>Accent Link</td>
                <td style='background-color: white; color: var(--color-active-accent-link);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-accent-link);'><span>█</span></td>
                <td style='background-color: var(--color-active-accent-bg); color: var(--color-active-accent-link);'><span>█</span></td>
            </tr>
            <tr>
                <td>Accent Outline</td>
                <td style='background-color: white; color: var(--color-active-accent-outline);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-accent-outline);'><span>█</span></td>
                <td style='background-color: var(--color-active-accent-bg); color: var(--color-active-accent-outline);'><span>█</span></td>
            </tr>
            <tr>
                <td>Error</td>
                <td style='background-color: white; color: var(--color-active-error-text);'><span>█</span></td>
                <td style='background-color: black; color: var(--color-active-error-text);'><span>█</span></td>
                <td style='background-color: var(--color-active-bg); color: var(--color-active-error-text);'><span>█</span></td>
            </tr>
        </tbody>
    </table>
`;

const colorSchemeElementTable = `
    <table class='colorscheme standard-table'>
        <thead>
            <tr>
                <th>Element</th>
                <th>Primary</th>
                <th>Secondary</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Background</td>
                <td class='theme-primary'></td>
                <td class='theme-secondary'></td>
            </tr>
            <tr>
                <td>Text</td>
                <td class='theme-primary'><span>Primary</span></td>
                <td class='theme-secondary'><span>Secondary</span></td>
            </tr>
            <tr>
                <td>Accent</td>
                <td class='theme-primary'><span class='theme-accent'>Primary</span></td>
                <td class='theme-secondary'><span class='theme-accent'>Secondary</span></td>
            </tr>
            <tr>
                <td>Link</td>
                <td class='theme-primary'><a href='#'>Primary</a></td>
                <td class='theme-secondary'><a href='#'>Secondary</a></td>
            </tr>
            <tr>
                <td>Code</td>
                <td class='theme-primary'><code>Primary</code></td>
                <td class='theme-secondary'><code>Secondary</code></td>
            </tr>
            <tr>
                <td>Button</td>
                <td class='theme-primary'><button>Primary</button></td>
                <td class='theme-secondary'><button>Secondary</button></td>
            </tr>
            <tr>
                <td>Button (Disabled)</td>
                <td class='theme-primary'><button disabled=''>Primary</button></td>
                <td class='theme-secondary'><button disabled=''>Secondary</button></td>
            </tr>
            <tr>
                <td>Card (Link)</td>
                <td class='theme-primary'>
                    <div class='card drop-shadow' data-type='link' data-name='link'>
                        <span><a>Primary</a></span>
                    </div>
                </td>
                <td class='theme-secondary'>
                    <div class='card drop-shadow' data-type='link' data-name='link'>
                        <span><a>Secondary</a></span>
                    </div>
                </td>
            </tr>
            <tr>
                <td>Card (Small)</td>
                <td class='theme-primary'>
                    <div class='card drop-shadow' data-type='small' data-name='small'>
                        <span>Primary</span>
                    </div>
                </td>
                <td class='theme-secondary'>
                    <div class='card drop-shadow' data-type='small' data-name='small'>
                        <span>Secondary</span>
                    </div>
                </td>
            </tr>
            <tr>
                <td>Horizontal Rule</td>
                <td class='theme-primary'><hr></td>
                <td class='theme-secondary'><hr></td>
            </tr>
        </tbody>
    </table>
`;

document.addEventListener("DOMContentLoaded", main);

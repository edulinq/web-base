const DEFAULT_LANGUAGE = 'plaintext';

const FALLBACK_ICON_NAME = '__fallback__';
let fallbackIconText = `
    <text x="30" y="85" font-size="95">?</text>
`;

// Registered icons.
// {name: svg inner text, ...}
let icons: Record<string, string> = {
    [FALLBACK_ICON_NAME]: fallbackIconText,
};

// Register an icon into the system.
function add(name: string, text: string) {
    icons[name] = text;
}

function getElement(name: string | undefined | null, title: string | undefined = undefined, classes: Array<string> | DOMTokenList = []) {
    if (name == null) {
        throw new Error("Icon must have a name.");
    }

    let text = icons[name];
    if (text == null) {
        console.warn(`Cannot find icon '${name}', falling back to '${FALLBACK_ICON_NAME}'.`);
        text = fallbackIconText;
    }

    if (title == null) {
        title = name;
    }

    let svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.classList.add('icon');
    svgElement.classList.add(...classes);
    svgElement.setAttribute('viewBox', '0 0 100 100');
    svgElement.innerHTML = `
        <title>${title}</title>
        ${text}
    `;

    return svgElement;
}

// Replace all icon placeholders in the document with actual icons.
// A placeholder should be: `<icon class='edq-icon-placeholder' name='<icon name>' />`.
function replacePlaceholders() {
    for (const element of document.querySelectorAll<HTMLElement>('icon.icon-placeholder')) {
        element.classList.replace('icon-placeholder', 'icon');
        let newElement = getElement(element.getAttribute('name'), element.textContent, element.classList);
        element.parentElement?.replaceChild(newElement, element);
    }
}

// Get the registered icon names.
function getNames(): Array<String> {
    return Object.keys(icons).sort();
}

export {
    FALLBACK_ICON_NAME,

    add,
    getElement,
    getNames,
    replacePlaceholders,
}

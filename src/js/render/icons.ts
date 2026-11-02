const DEFAULT_LANGUAGE = 'plaintext';

// Registered icons.
// {name: svg inner text, ...}
let icons: Record<string, string> = {};

let defaultIconText = '';

function addIcon(name: string, text: string) {
    icons[name] = text;
}

function getIconElement(name: string | undefined | null, title: string | undefined = undefined, classes: Array<string> | DOMTokenList = []) {
    if (name == null) {
        throw new Error("Icon must have a name.");
    }

    let text = icons[name];
    if (text == null) {
        console.warn(`Cannot find icon '${name}', falling back to default.`);
        text = defaultIconText;
    }

    if (title == null) {
        title = name;
    }

    let svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
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
function replaceIconPlaceholders() {
    for (const element of document.querySelectorAll<HTMLElement>('icon.icon-placeholder')) {
        element.classList.replace('icon-placeholder', 'icon');
        let newElement = getIconElement(element.getAttribute('name'), element.textContent, element.classList);
        element.parentElement?.replaceChild(newElement, element);
    }
}

export {
    addIcon,
    getIconElement,
    replaceIconPlaceholders,
}

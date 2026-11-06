// @ts-ignore: esbuild will resolve this reference.
import Prism from '../../vendor/prismjs/prism.cjs';

const DEFAULT_LANGUAGE = 'plaintext';

function init() {
    Prism.manual = true;
}

// Render text inside a code block with syntax highlighting, and return the block.
function block(text: string, language: string = DEFAULT_LANGUAGE): HTMLElement {
    if (!Prism.languages.hasOwnProperty(language)) {
        console.warn(`Unknown code language '${language}'. Falling back to plan text for highlighting.`);
        language = DEFAULT_LANGUAGE;
    }

    let codeElement = document.createElement('code');
    codeElement.classList.add(`language-${language}`);
    codeElement.innerHTML = (new Option(text)).innerHTML;

    let preElement = document.createElement('pre');
    preElement.classList.add(`language-${language}`);
    preElement.appendChild(codeElement);

    let container = document.createElement('div');
    container.classList.add('code-container', 'code-block-container');
    container.replaceChildren(preElement);

    Prism.highlightAllUnder(container);

    return container;
}

init();

export {
    block,
}

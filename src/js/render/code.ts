// @ts-ignore: esbuild will resolve this reference.
import Prism from '../../vendor/prismjs/prism.cjs';

const DEFAULT_LANGUAGE = 'plaintext';

function init() {
    Prism.manual = true;
}

// Render text inside a code block with syntax highlighting.
function block(
        container: HTMLElement,
        text: string,
        language: string = DEFAULT_LANGUAGE,
        ) {
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

    container.replaceChildren(preElement);

    Prism.highlightAllUnder(container);
}

init();

export {
    block,
}

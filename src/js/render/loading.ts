import * as icons from './icons';

const DEFAULT_LOADING_ICON = 'a-dots-line';

let defaultIcon = DEFAULT_LOADING_ICON;

function setDefaultIcon(icon: string) {
    defaultIcon = icon;
}

/**
 * Activate a loading overlay on the given element (or the page body if none is supplied).
 */
function activate(container: HTMLElement | undefined = undefined, icon: string | undefined = undefined) {
    if (container == null) {
        container = document.body;
    }

    if (icon == null) {
        icon = defaultIcon;
    }

    const overlay = document.createElement('div');
    overlay.classList.add('loading-overlay');

    overlay.appendChild(icons.getElement(icon));

    container.appendChild(overlay);
}

/**
 * Deactivate a loading overlay on the given element (or the page body if none is supplied).
 */
function deactivate(container: HTMLElement | undefined = undefined, icon = undefined) {
    if (container == null) {
        container = document.body;
    }

    let overlay = container.querySelector('.loading-overlay');
    if (overlay != null) {
        container.removeChild(overlay);
    }
}

/**
 * Wrap a promise with abother promise that activate a loading overlay right away and deactivate when the promise is settled.
 */
function withPromise(promise: Promise<any>, container: HTMLElement | undefined = undefined, icon: string | undefined = undefined): Promise<any> {
    activate(container, icon);

    return promise.finally(function() {
        deactivate(container);
    });
}

export {
    setDefaultIcon,

    activate,
    deactivate,
    withPromise,
}

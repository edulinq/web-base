import * as edq from './edq.js';

const ICONS_URL = 'images/icons.svg';

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
                    <svg class="light-only" role="img" aria-labelledby="icon-label-${baseName}-light">
                        <title id="icon-label-${baseName}-light">${edq.util.strings.titleCase(baseName)}</title>
                        <use href="${ICONS_URL}#${baseName}-light"></use>
                    </svg>
                    <svg class="dark-only" role="img" aria-labelledby="icon-label-${baseName}-dark">
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

function main() {
    loadIcons();
}

document.addEventListener("DOMContentLoaded", main);

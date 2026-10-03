let _isLightmode: undefined | boolean = undefined;

function initBrightmode() {
    setBrightmode(isSystemLightmode());

    let toggle = document.querySelector<HTMLElement>('.brightmode-toggle');
    if (toggle) {
        toggle.addEventListener('click', function(event) {
            let lightSelection = document.querySelector<HTMLElement>('.brightmode-toggle .lightmode');
            if (lightSelection == null) {
                throw new Error('Brightmode toggle has no light element.');
            }

            setBrightmode(!lightSelection.classList.contains('active'));
        });
    }

    // Watch for system changes.
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(event) {
            setBrightmode(!event.matches);
        });
    }
}

function setBrightmode(isLight: boolean) {
    _isLightmode = isLight;

    // Set UI bright mode selector.
    document.querySelectorAll<HTMLElement>('.brightmode-toggle .selector').forEach(function(element) {
        if ((isLight && element.classList.contains('lightmode')) || (!isLight && element.classList.contains('darkmode'))) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });

    // Set the page's mode.
    let html = (document.querySelector<HTMLElement>('html') as HTMLElement);
    if (isLight) {
        html.classList.remove('darkmode');
        html.classList.add('lightmode');
    } else {
        html.classList.remove('lightmode');
        html.classList.add('darkmode');
    }

    html.classList.remove('no-brightness-selection');
}

function isSystemLightmode(): boolean {
    // Default to light mode.
    if (!window.matchMedia) {
        return true;
    }

    return !window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function isLightmode(): boolean {
    if (_isLightmode == null) {
        return false;
    }

    return _isLightmode;
}

function isDarkmode(): boolean {
    return !isLightmode();
}

export {
    initBrightmode,
    setBrightmode,
}

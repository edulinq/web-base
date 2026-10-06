const DEFAULT_INDENT = 4;

type ReplacerFunc = (key: any, value: any) => any;

// This projects recommended way to serialize JSON.
// It will set standard options for the conversion (like making undefined and null consistent).
function stringify(value: string | object, replacer: ReplacerFunc = defaultReplacer) {
    if ((typeof value) === 'string') {
        value = JSON.parse(value);
    }

    return JSON.stringify(value, replacer);
}

// Create a "pretty" representation of a JSON object.
// If the input is an object, it JSON.stringify() will be directly used.
// If the input is a string, it will first be put through JSON.parse() and then JSON.stringify().
function pretty(value: string | object, indent: number = DEFAULT_INDENT, replacer: ReplacerFunc = defaultReplacer): string {
    if ((typeof value) === 'string') {
        value = JSON.parse(value);
    }

    return JSON.stringify(value, replacer, indent)
}

function defaultReplacer(key: any, value: any): any {
    if (value == null) {
        return null;
    }

    return value;
}

export {
    DEFAULT_INDENT,

    stringify,
    pretty,

    defaultReplacer,
}

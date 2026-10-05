const DEFAULT_INDENT = 4;

// Create a "pretty" representation of a JSON object.
// If the input is an object, it JSON.stringify() will be directly used.
// If the input is a string, it will first be put through JSON.parse() and then JSON.stringify().
function pretty(value: string | object, indent: number = DEFAULT_INDENT): string {
    if ((typeof value) === 'string') {
        value = JSON.parse(value);
    }

    return JSON.stringify(value, null, indent)
}

export {
    DEFAULT_INDENT,

    pretty,
}

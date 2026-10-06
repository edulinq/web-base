import * as json from './json';

describe("pretty() base", function() {
    // [[input, indent, expected], ...]
    const testCases: Array<[string | object, number, string]> = [
        // String Input
        [`{"a": 1, "b": 2}`, 4, `
{
    "a": 1,
    "b": 2
}
        `.trim()],

        // Object Input
        [{foo: 'bar', a: 123}, 4, `
{
    "foo": "bar",
    "a": 123
}
        `.trim()],
    ];

    test.each(testCases)("('%s', %s)", function(input, indent, expected) {
        expect(json.pretty(input, indent)).toBe(expected);
    });
});

describe("stringify() base", function() {
    // [[input, indent, expected], ...]
    const testCases: Array<[string | object, string]> = [
        // String Input
        [`{"a": 1, "b": 2}`, `{"a":1,"b":2}`],

        // Object Input
        [{foo: 'bar', a: 123}, `{"foo":"bar","a":123}`],

        // Undefined
        [{'a': undefined}, `{"a":null}`],

        // Null
        [{'a': null}, `{"a":null}`],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(json.stringify(input)).toBe(expected);
    });
});

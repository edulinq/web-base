import * as json from './json';

describe("pretty() base", function() {
    // [[input, indent, expected], ...]
    const testCases: Array<[string | object, number, string]> = [
        [`{"a": 1, "b": 2}`, 4, `
{
    "a": 1,
    "b": 2
}
        `.trim()],

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

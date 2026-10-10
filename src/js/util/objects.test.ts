import * as objects from './objects';

const testPrimitives: Array<any> = [
    // Strings
    '',
    'abc',

    // Numbers (and BigInt)
    123,
    3.14,
    NaN,
    BigInt(123),

    // Booleans
    true,
    false,

    // Nils
    undefined,
    null,

    // Symbols
    Symbol(),
    Symbol('foo'),
];

const testObjects: Array<any> = [
    {},
    {'a': 1},
];

// These are "objects" that are not pure objects.
const testNonObjects: Array<any> = [
    new Map(),
    new Set(),
    new Date(),
];

const testArrays: Array<any> = [
    [],
    [1],
    new Array(),
];

const testFunctions: Array<any> = [
    objects.isPrimitive,
    function() {},
    () => null,
    Object,
    Array,
    Map,
];

describe("isPrimitive() base", function() {
    // [[input, expected], ...]
    const testCases: Array<[any, boolean]> = [];

    for (const value of testPrimitives) {
        testCases.push([value, true]);
    }

    for (const value of (testObjects.concat(testNonObjects, testArrays, testFunctions))) {
        testCases.push([value, false]);
    }

    test.each(testCases)("`%s`", function(input, expected) {
        expect(objects.isPrimitive(input)).toBe(expected);
    });
});

describe("isFunction() base", function() {
    // [[input, expected], ...]
    const testCases: Array<[any, boolean]> = [];

    for (const value of testFunctions) {
        testCases.push([value, true]);
    }

    for (const value of (testPrimitives.concat(testObjects, testNonObjects, testArrays))) {
        testCases.push([value, false]);
    }

    test.each(testCases)("`%s`", function(input, expected) {
        expect(objects.isFunction(input)).toBe(expected);
    });
});

describe("isArray() base", function() {
    // [[input, expected], ...]
    const testCases: Array<[any, boolean]> = [];

    for (const value of testArrays) {
        testCases.push([value, true]);
    }

    for (const value of (testPrimitives.concat(testObjects, testNonObjects, testFunctions))) {
        testCases.push([value, false]);
    }

    test.each(testCases)("`%s`", function(input, expected) {
        expect(objects.isArray(input)).toBe(expected);
    });
});

describe("isObject() base", function() {
    // [[input, expected], ...]
    const testCases: Array<[any, boolean]> = [];

    for (const value of testObjects) {
        testCases.push([value, true]);
    }

    for (const value of (testPrimitives.concat(testNonObjects, testArrays, testFunctions))) {
        testCases.push([value, false]);
    }

    test.each(testCases)("`%s`", function(input, expected) {
        expect(objects.isObject(input)).toBe(expected);
    });
});

describe("deepEqual() base", function() {
    // [[a, b, expected], ...]
    const testCases: Array<[any, any, boolean]> = [
        // Primitives

        ['', '', true],
        ['a', 'A', false],
        ['', 'a', false],

        [123, 123, true],
        [123, 123.0, true],
        [123, 123.1, false],
        [123, BigInt(123), false],
        [BigInt(123), BigInt(123), true],
        [BigInt(0), BigInt(123), false],
        [NaN, NaN, false],  // NaN is equal to nothing.

        [true, true, true],
        [false, false, true],
        [true, false, false],
        [false, true, false],

        [undefined, undefined, true],
        [null, null, true],
        [undefined, null, false],
        [null, undefined, false],

        [Symbol(), Symbol(), false],
        [Symbol('foo'), Symbol('foo'), false],
        [Symbol.for('foo'), Symbol.for('foo'), true],

        [undefined, 'undefined', false],

        // Falsy Values

        [false, null, false],
        [false, undefined, false],
        [false, NaN, false],
        [false, 0, false],
        [false, -0, false],
        [false, BigInt(0), false],
        [false, '', false],

        // Objects

        [{}, {}, true],
        [{}, {'a': 1}, false],
        [{'a': 1}, {'a': 1}, true],
        [{'a': 1, 'b': 2}, {'b': 2, 'a': 1}, true],
        [{'a': 1, 'b': 2}, {'b': 999, 'a': 1}, false],
        [{'a': {'b': 1}}, {'a': {'b': 1}}, true],
        [{'a': {'b': 1}}, {'a': {'b': 999}}, false],
        [{'a': {'b': false}}, {'a': {'b': 0}}, false],

        // Arrays

        [[], [], true],
        [[], [1], false],
        [[1, 2], [1, 2], true],
        [[1, 2], [1, 999], false],
        [[1, [2]], [1, 2], false],
        [[1, [2]], [1, [2]], true],

        // Functions

        [objects.isPrimitive, objects.isPrimitive, true],
        [objects.isPrimitive, null, false],
        [objects.isPrimitive, function() {}, false],
        [function() {}, function() {}, false],
        [testFunctions[1], testFunctions[1], true],
    ];

    test.each(testCases)("'%s' vs '%s'", function(a, b, expected) {
        expect(objects.deepEqual(a, b)).toBe(expected);
    });
});

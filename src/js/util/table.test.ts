import * as table from './table';

describe("defaultTableTextCompare() base", function() {
    // [[a, b, expected], ...]
    const testCases: Array<[string, string, number]> = [
        // Equal
        ['', '', 0],
        ['a', 'a', 0],
        ['123', '123', 0],
        [' ', '', 0],
        [' 123', '123 ', 0],

        // Basic Mismatch

        ['a', 'b', -1],
        ['b', 'a', 1],

        ['A', 'B', -1],
        ['B', 'A', 1],

        ['a', 'A', -1],
        ['A', 'a', 1],

        // Number Value

        ['1', '2', -1],
        ['2', '1', 1],
        ['1', '2', -1],

        ['0001', '1', 0],
        ['0001', '2', -1],
        ['1', '-2', 3],
    ];

    test.each(testCases)("('%s', '%s')", function(a, b, expected) {
        expect(table.defaultTableTextCompare(a, b)).toBe(expected);
    });
});

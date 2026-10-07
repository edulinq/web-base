import * as timestamp from './timestamp.js';

test("now() base", function() {
    expect(timestamp.now()).toBeDefined();
});

describe("fromJSDate() base", function() {
    // [[input, expected], ...]
    const testCases: Array<[Date, timestamp.Timestamp]> = [
        [new Date('1970-01-01T00:00:00.000Z'), 0],
    ];

    test.each(testCases)("(%s, %s')", function(input, expected) {
        expect(timestamp.fromJSDate(input)).toBe(expected);
    });
});

describe("parse() base", function() {
    // [[input, forceLocalTZ, allowEmpty, expected], ...]
    const testCases: Array<[string, boolean, boolean, timestamp.Timestamp | undefined]> = [
        // Base
        ['1970-01-01T00:00:00.000Z', false, false, 0],
        ['1970-01-01T00:00:00.000Z', false, true, 0],

        // Invalid Parse
        ['', false, false, undefined],
        ['', false, true, undefined],
        ['abc', false, false, undefined],

        // Timezone Issues

        // No timezone means this will be parsed as local time (which we can't set in this case).
        ['1970-01-01T00:00:00.000', false, false, new Date('1970-01-01T00:00:00').valueOf()],

        // Dates are always parsed as UTC.
        ['1970-01-01', false, false, 0],

        // Offset the date from UTC to local.
        ['1970-01-01', true, false, new Date('1970-01-01T00:00:00-02:00').valueOf()],
    ];

    test.each(testCases)("('%s', %s, %s)", function(input, forceLocalTZ, allowEmpty, expected) {
        expect(timestamp.parse(input, forceLocalTZ, allowEmpty, false)).toBe(expected);
    });
});

describe("timestampToString() base", function() {
    // [[input, pretty, locale, expected], ...]
    const testCases: Array<[number, boolean, string, string]> = [
        // Unix Epoch
        [0, false, timestamp.DEFAUT_LOCALE, '1970-01-01T00:00:00.000Z'],
        [0, true, timestamp.DEFAUT_LOCALE, '1969-12-31 22:00:00'],
        [0, true, 'en-US', '12/31/1969, 10:00:00 PM'],

        // After Unix Epoch

        [timestamp.MSECS_PER_SECS, false, timestamp.DEFAUT_LOCALE, '1970-01-01T00:00:01.000Z'],
        [timestamp.MSECS_PER_SECS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 22:00:01'],
        [timestamp.MSECS_PER_SECS, true, 'en-US', '12/31/1969, 10:00:01 PM'],

        [timestamp.MSECS_PER_MINS, false, timestamp.DEFAUT_LOCALE, '1970-01-01T00:01:00.000Z'],
        [timestamp.MSECS_PER_MINS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 22:01:00'],
        [timestamp.MSECS_PER_MINS, true, 'en-US', '12/31/1969, 10:01:00 PM'],

        [timestamp.MSECS_PER_HOURS, false, timestamp.DEFAUT_LOCALE, '1970-01-01T01:00:00.000Z'],
        [timestamp.MSECS_PER_HOURS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 23:00:00'],
        [timestamp.MSECS_PER_HOURS, true, 'en-US', '12/31/1969, 11:00:00 PM'],

        [timestamp.MSECS_PER_DAYS, false, timestamp.DEFAUT_LOCALE, '1970-01-02T00:00:00.000Z'],
        [timestamp.MSECS_PER_DAYS, true, timestamp.DEFAUT_LOCALE, '1970-01-01 22:00:00'],
        [timestamp.MSECS_PER_DAYS, true, 'en-US', '1/1/1970, 10:00:00 PM'],

        // Before Unix Epoch

        [-1 * timestamp.MSECS_PER_SECS, false, timestamp.DEFAUT_LOCALE, '1969-12-31T23:59:59.000Z'],
        [-1 * timestamp.MSECS_PER_SECS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 21:59:59'],
        [-1 * timestamp.MSECS_PER_SECS, true, 'en-US', '12/31/1969, 9:59:59 PM'],

        [-1 * timestamp.MSECS_PER_MINS, false, timestamp.DEFAUT_LOCALE, '1969-12-31T23:59:00.000Z'],
        [-1 * timestamp.MSECS_PER_MINS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 21:59:00'],
        [-1 * timestamp.MSECS_PER_MINS, true, 'en-US', '12/31/1969, 9:59:00 PM'],

        [-1 * timestamp.MSECS_PER_HOURS, false, timestamp.DEFAUT_LOCALE, '1969-12-31T23:00:00.000Z'],
        [-1 * timestamp.MSECS_PER_HOURS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 21:00:00'],
        [-1 * timestamp.MSECS_PER_HOURS, true, 'en-US', '12/31/1969, 9:00:00 PM'],

        [-1 * timestamp.MSECS_PER_DAYS, false, timestamp.DEFAUT_LOCALE, '1969-12-31T00:00:00.000Z'],
        [-1 * timestamp.MSECS_PER_DAYS, true, timestamp.DEFAUT_LOCALE, '1969-12-30 22:00:00'],
        [-1 * timestamp.MSECS_PER_DAYS, true, 'en-US', '12/30/1969, 10:00:00 PM'],
    ];

    test.each(testCases)("(%s, %s, '%s')", function(input, pretty, locale, expected) {
        expect(timestamp.timestampToString(input, pretty, locale)).toBe(expected);
    });
});

describe("datestampToString() base", function() {
    // [[input, pretty, locale, expected], ...]
    const testCases: Array<[number, boolean, string, string]> = [
        // Unix Epoch
        [0, false, timestamp.DEFAUT_LOCALE, '1969-12-31'],
        [0, true, timestamp.DEFAUT_LOCALE, '1969-12-31'],
        [0, true, 'en-US', '12/31/1969'],

        // After Unix Epoch
        [timestamp.MSECS_PER_SECS, false, timestamp.DEFAUT_LOCALE, '1969-12-31'],
        [timestamp.MSECS_PER_SECS, true, timestamp.DEFAUT_LOCALE, '1969-12-31'],
        [timestamp.MSECS_PER_SECS, true, 'en-US', '12/31/1969'],

        // Before Unix Epoch
        [-1 * timestamp.MSECS_PER_SECS, false, timestamp.DEFAUT_LOCALE, '1969-12-31'],
        [-1 * timestamp.MSECS_PER_SECS, true, timestamp.DEFAUT_LOCALE, '1969-12-31'],
        [-1 * timestamp.MSECS_PER_SECS, true, 'en-US', '12/31/1969'],
    ];

    test.each(testCases)("(%s, %s, '%s')", function(input, pretty, locale, expected) {
        expect(timestamp.datestampToString(input, pretty, locale)).toBe(expected);
    });
});

describe("embededTimestampsToString() base", function() {
    // [[input, pretty, locale, expected], ...]
    const testCases: Array<[string, boolean, string, string]> = [
        // No Timestamps
        ['Do you know when the Unix Epoch occured?', false, timestamp.DEFAUT_LOCALE, 'Do you know when the Unix Epoch occured?'],
        ['Do you know when the Unix Epoch occured?', true, timestamp.DEFAUT_LOCALE, 'Do you know when the Unix Epoch occured?'],
        ['Do you know when the Unix Epoch occured?', true, 'en-US', 'Do you know when the Unix Epoch occured?'],

        // One timestamp
        [`The Unix Epoch occured at '<timestamp:0>'.`, false, timestamp.DEFAUT_LOCALE, `The Unix Epoch occured at '1970-01-01T00:00:00.000Z'.`],
        [`The Unix Epoch occured at '<timestamp:0>'.`, true, timestamp.DEFAUT_LOCALE, `The Unix Epoch occured at '1969-12-31 22:00:00'.`],
        [`The Unix Epoch occured at '<timestamp:0>'.`, true, 'en-US', `The Unix Epoch occured at '12/31/1969, 10:00:00 PM'.`],

        // Multiple Timestamps
        [
            `That was after '<timestamp:${-1 * timestamp.MSECS_PER_DAYS}>' but before '<timestamp:${timestamp.MSECS_PER_DAYS}>'.`,
            false,
            timestamp.DEFAUT_LOCALE,
            `That was after '1969-12-31T00:00:00.000Z' but before '1970-01-02T00:00:00.000Z'.`,
        ],
        [
            `That was after '<timestamp:${-1 * timestamp.MSECS_PER_DAYS}>' but before '<timestamp:${timestamp.MSECS_PER_DAYS}>'.`,
            true,
            timestamp.DEFAUT_LOCALE,
            `That was after '1969-12-30 22:00:00' but before '1970-01-01 22:00:00'.`,
        ],
        [
            `That was after '<timestamp:${-1 * timestamp.MSECS_PER_DAYS}>' but before '<timestamp:${timestamp.MSECS_PER_DAYS}>'.`,
            true,
            'en-US',
            `That was after '12/30/1969, 10:00:00 PM' but before '1/1/1970, 10:00:00 PM'.`,
        ],
    ];

    test.each(testCases)("(%s, %s, '%s')", function(input, pretty, locale, expected) {
        expect(timestamp.embededTimestampsToString(input, pretty, locale)).toBe(expected);
    });
});

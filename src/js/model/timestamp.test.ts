import * as timestamp from './timestamp.js';

describe("timestampToString() base", function() {
    // [[input, pretty, locale, expected], ...]
    const testCases: Array<[number, boolean, string, string]> = [
        // Unix Epoch
        [0, false, timestamp.DEFAUT_LOCALE, '1970-01-01T00:00:00.000Z'],
        [0, true, timestamp.DEFAUT_LOCALE, '1970-01-01 00:00:00'],
        [0, true, 'en-US', '1/1/1970, 12:00:00 AM'],

        // After Unix Epoch

        [timestamp.MSECS_PER_SECS, false, timestamp.DEFAUT_LOCALE, '1970-01-01T00:00:01.000Z'],
        [timestamp.MSECS_PER_SECS, true, timestamp.DEFAUT_LOCALE, '1970-01-01 00:00:01'],
        [timestamp.MSECS_PER_SECS, true, 'en-US', '1/1/1970, 12:00:01 AM'],

        [timestamp.MSECS_PER_MINS, false, timestamp.DEFAUT_LOCALE, '1970-01-01T00:01:00.000Z'],
        [timestamp.MSECS_PER_MINS, true, timestamp.DEFAUT_LOCALE, '1970-01-01 00:01:00'],
        [timestamp.MSECS_PER_MINS, true, 'en-US', '1/1/1970, 12:01:00 AM'],

        [timestamp.MSECS_PER_HOURS, false, timestamp.DEFAUT_LOCALE, '1970-01-01T01:00:00.000Z'],
        [timestamp.MSECS_PER_HOURS, true, timestamp.DEFAUT_LOCALE, '1970-01-01 01:00:00'],
        [timestamp.MSECS_PER_HOURS, true, 'en-US', '1/1/1970, 1:00:00 AM'],

        [timestamp.MSECS_PER_DAYS, false, timestamp.DEFAUT_LOCALE, '1970-01-02T00:00:00.000Z'],
        [timestamp.MSECS_PER_DAYS, true, timestamp.DEFAUT_LOCALE, '1970-01-02 00:00:00'],
        [timestamp.MSECS_PER_DAYS, true, 'en-US', '1/2/1970, 12:00:00 AM'],

        // Before Unix Epoch

        [-1 * timestamp.MSECS_PER_SECS, false, timestamp.DEFAUT_LOCALE, '1969-12-31T23:59:59.000Z'],
        [-1 * timestamp.MSECS_PER_SECS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 23:59:59'],
        [-1 * timestamp.MSECS_PER_SECS, true, 'en-US', '12/31/1969, 11:59:59 PM'],

        [-1 * timestamp.MSECS_PER_MINS, false, timestamp.DEFAUT_LOCALE, '1969-12-31T23:59:00.000Z'],
        [-1 * timestamp.MSECS_PER_MINS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 23:59:00'],
        [-1 * timestamp.MSECS_PER_MINS, true, 'en-US', '12/31/1969, 11:59:00 PM'],

        [-1 * timestamp.MSECS_PER_HOURS, false, timestamp.DEFAUT_LOCALE, '1969-12-31T23:00:00.000Z'],
        [-1 * timestamp.MSECS_PER_HOURS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 23:00:00'],
        [-1 * timestamp.MSECS_PER_HOURS, true, 'en-US', '12/31/1969, 11:00:00 PM'],

        [-1 * timestamp.MSECS_PER_DAYS, false, timestamp.DEFAUT_LOCALE, '1969-12-31T00:00:00.000Z'],
        [-1 * timestamp.MSECS_PER_DAYS, true, timestamp.DEFAUT_LOCALE, '1969-12-31 00:00:00'],
        [-1 * timestamp.MSECS_PER_DAYS, true, 'en-US', '12/31/1969, 12:00:00 AM'],
    ];

    test.each(testCases)("(%s, %s, '%s')", function(input, pretty, locale, expected) {
        expect(timestamp.timestampToString(input, pretty, locale)).toBe(expected);
    });
});

describe("datestampToString() base", function() {
    // [[input, pretty, locale, expected], ...]
    const testCases: Array<[number, boolean, string, string]> = [
        // Unix Epoch
        [0, false, timestamp.DEFAUT_LOCALE, '1970-01-01'],
        [0, true, timestamp.DEFAUT_LOCALE, '1970-01-01'],
        [0, true, 'en-US', '1/1/1970'],

        // After Unix Epoch
        [timestamp.MSECS_PER_SECS, false, timestamp.DEFAUT_LOCALE, '1970-01-01'],
        [timestamp.MSECS_PER_SECS, true, timestamp.DEFAUT_LOCALE, '1970-01-01'],
        [timestamp.MSECS_PER_SECS, true, 'en-US', '1/1/1970'],

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
        [`The Unix Epoch occured at '<timestamp:0>'.`, true, timestamp.DEFAUT_LOCALE, `The Unix Epoch occured at '1970-01-01 00:00:00'.`],
        [`The Unix Epoch occured at '<timestamp:0>'.`, true, 'en-US', `The Unix Epoch occured at '1/1/1970, 12:00:00 AM'.`],

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
            `That was after '1969-12-31 00:00:00' but before '1970-01-02 00:00:00'.`,
        ],
        [
            `That was after '<timestamp:${-1 * timestamp.MSECS_PER_DAYS}>' but before '<timestamp:${timestamp.MSECS_PER_DAYS}>'.`,
            true,
            'en-US',
            `That was after '12/31/1969, 12:00:00 AM' but before '1/2/1970, 12:00:00 AM'.`,
        ],
    ];

    test.each(testCases)("(%s, %s, '%s')", function(input, pretty, locale, expected) {
        expect(timestamp.embededTimestampsToString(input, pretty, locale)).toBe(expected);
    });
});

import * as timestamp from './timestamp.js';

describe("timestampToPretty() base", function() {
    // [[input, expected], ...]
    const testCases: Array<[number, string]> = [
        // Unix Epoch
        [0, '1/1/1970, 12:00:00 AM'],

        // After Unix Epoch
        [timestamp.MSECS_PER_SECS, '1/1/1970, 12:00:01 AM'],
        [timestamp.MSECS_PER_MINS, '1/1/1970, 12:01:00 AM'],
        [timestamp.MSECS_PER_HOURS, '1/1/1970, 1:00:00 AM'],
        [timestamp.MSECS_PER_DAYS, '1/2/1970, 12:00:00 AM'],

        // Before Unix Epoch
        [-1 * timestamp.MSECS_PER_SECS, '12/31/1969, 11:59:59 PM'],
        [-1 * timestamp.MSECS_PER_MINS, '12/31/1969, 11:59:00 PM'],
        [-1 * timestamp.MSECS_PER_HOURS, '12/31/1969, 11:00:00 PM'],
        [-1 * timestamp.MSECS_PER_DAYS, '12/31/1969, 12:00:00 AM'],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(timestamp.timestampToPretty(input)).toBe(expected);
    });
});

describe("embededTimestampsToPretty() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // No Timestamps
        ['Do you know when the Unix Epoch occured?', 'Do you know when the Unix Epoch occured?'],

        // One timestamp
        [`The Unix Epoch occured at '<timestamp:0>'.`, `The Unix Epoch occured at '1/1/1970, 12:00:00 AM'.`],

        // Multiple Timestamps
        [
            `That was after '<timestamp:${-1 * timestamp.MSECS_PER_DAYS}>' but before '<timestamp:${timestamp.MSECS_PER_DAYS}>'.`,
            `That was after '12/31/1969, 12:00:00 AM' but before '1/2/1970, 12:00:00 AM'.`,
        ],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(timestamp.embededTimestampsToPretty(input)).toBe(expected);
    });
});

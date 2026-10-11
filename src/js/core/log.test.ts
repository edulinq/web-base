import * as log from './log';

test("logging functions base", function() {
    log.clearRecords();

    expect(log.getRecords()).toStrictEqual([]);

    // Set the log levels.
    const oldConsoleLevel = log.setLevel(log.LEVEL_TRACE);
    const oldStorageLevel = log.setStorageLevel(log.LEVEL_TRACE);

    // Make some logs.
    log.trace('Trace Log');
    log.debug('Debug Log');
    log.info('Info Log');
    log.warn('Warn Log');
    log.error('Error Log');
    log.fatal('Fatal Log');

    // Reset the log levels.
    log.setLevel(oldConsoleLevel);
    log.setStorageLevel(oldStorageLevel);

    let expected = [
        ['trace', 'Trace Log'],
        ['debug', 'Debug Log'],
        ['info', 'Info Log'],
        ['warn', 'Warn Log'],
        ['error', 'Error Log'],
        ['fatal', 'Fatal Log'],
    ];

    let actual = [];
    for (const record of log.getRecords()) {
        actual.push([record.level, record.message]);
    }

    expect(actual).toStrictEqual(expected);
})

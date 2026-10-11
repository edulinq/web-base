import * as timestamp from '../model/timestamp';

const LEVEL_TRACE: LogLevel = -20;
const LEVEL_DEBUG: LogLevel = -10;
const LEVEL_INFO: LogLevel = 0;
const LEVEL_WARN: LogLevel = 10;
const LEVEL_ERROR: LogLevel = 20;
const LEVEL_FATAL: LogLevel = 30;
const LEVEL_OFF: LogLevel = 100;

const LEVEL_TO_STRING: Record<number, string> = {
    [LEVEL_TRACE]: "trace",
    [LEVEL_DEBUG]: "debug",
    [LEVEL_INFO]: "info",
    [LEVEL_WARN]: "warn",
    [LEVEL_ERROR]: "error",
    [LEVEL_FATAL]: "fatal",
    [LEVEL_OFF]: "off",
}

let consoleLogLevel: LogLevel = LEVEL_INFO;
let storageLogLevel: LogLevel = LEVEL_OFF;

let records: Array<LogRecord> = [];

type LogLevel = number;

class LogRecord {
    timestamp: timestamp.Timestamp;
    level: string;
    rawLevel: LogLevel;
    message: string;
    error: Error | undefined;
    notify: boolean;
    data: Record<string, any>;

    constructor(
            timestamp: timestamp.Timestamp,
            level: string,
            rawLevel: LogLevel,
            message: string,
            error: Error | undefined,
            notify: boolean,
            data: Record<string, any>,
            ) {
        this.timestamp = timestamp;
        this.level = level;
        this.rawLevel = rawLevel;
        this.message = message;
        this.error = error;
        this.notify = notify;

        if (data == null) {
            data = {};
        }

        this.data = data;
    }
}

// Get the current console logging level.
function getLevel(): LogLevel {
    return consoleLogLevel;
}

// Set the current console logging level and return the old level.
function setLevel(level: LogLevel): LogLevel {
    let oldLevel = consoleLogLevel;
    consoleLogLevel = level;
    return oldLevel;
}

// Get the current storage logging level.
function getStorageLevel(): LogLevel {
    return storageLogLevel;
}

// Set the current storage logging level and return the old level.
function setStorageLevel(level: LogLevel): LogLevel {
    let oldLevel = storageLogLevel;
    storageLogLevel = level;
    return oldLevel;
}

function log(
        level: LogLevel,
        message: string,
        data: Record<string, any> = {},
        error: Error | undefined = undefined,
        notify: boolean = false,
        ) {
    if (level < Math.min(consoleLogLevel, storageLogLevel)) {
        return;
    }

    let record = new LogRecord(
        timestamp.now(),
        LEVEL_TO_STRING[level],
        level,
        message,
        error,
        notify,
        data,
    );

    logToConsole(record);
    logToStorage(record);
}

function logToConsole(record: LogRecord) {
    if (record.rawLevel < consoleLogLevel) {
        return;
    }

    // Divide up our fine levels into the more sparse console ones.
    if (record.rawLevel <= LEVEL_DEBUG) {
        console.debug(record);
    } else if (record.rawLevel <= LEVEL_INFO) {
        console.info(record);
    } else if (record.rawLevel <= LEVEL_WARN) {
        console.warn(record);
    } else {
        console.error(record);
    }

    // Explicitly log errors to get out all the info (browsers will often treat them specially).
    if (record.error != null) {
        console.log(record.error);
    }

    if (record.notify) {
        alert(record.message);
    }
}

function logToStorage(record: LogRecord) {
    if (record.rawLevel < storageLogLevel) {
        return;
    }

    records.push(record);
}

function trace(message: string, data: Record<string, any> = {}, error: Error | undefined = undefined, notify: boolean = false) {
    log(LEVEL_TRACE, message, data, error, notify);
}

function debug(message: string, data: Record<string, any> = {}, error: Error | undefined = undefined, notify: boolean = false) {
    log(LEVEL_DEBUG, message, data, error, notify);
}

function info(message: string, data: Record<string, any> = {}, error: Error | undefined = undefined, notify: boolean = false) {
    log(LEVEL_INFO, message, data, error, notify);
}

function warn(message: string, data: Record<string, any> = {}, error: Error | undefined = undefined, notify: boolean = false) {
    log(LEVEL_WARN, message, data, error, notify);
}

function error(message: string, data: Record<string, any> = {}, error: Error | undefined = undefined, notify: boolean = false) {
    log(LEVEL_ERROR, message, data, error, notify);
}

function fatal(message: string, data: Record<string, any> = {}, error: Error | undefined = undefined, notify: boolean = false) {
    log(LEVEL_FATAL, message, data, error, notify);
}

function getRecords(): Array<LogRecord> {
    return records.slice();
}

function clearRecords() {
    records = [];
}

export {
    LEVEL_OFF,
    LEVEL_TRACE,
    LEVEL_DEBUG,
    LEVEL_INFO,
    LEVEL_WARN,
    LEVEL_ERROR,
    LEVEL_FATAL,

    getLevel,
    setLevel,
    getStorageLevel,
    setStorageLevel,

    log,

    trace,
    debug,
    info,
    warn,
    error,
    fatal,

    getRecords,
    clearRecords,
}

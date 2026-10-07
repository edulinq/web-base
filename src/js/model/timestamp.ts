import * as testing from '../testing/index';

const MSECS_PER_SECS: number = 1000
const MSECS_PER_MINS: number = MSECS_PER_SECS * 60
const MSECS_PER_HOURS: number = MSECS_PER_MINS * 60
const MSECS_PER_DAYS: number = MSECS_PER_HOURS * 24

// Use Sweden's local because it looks nice.
const DEFAUT_LOCALE: string = 'sv';
const TESTING_TIME_ZONE: string = 'UTC';

// Timestamps are milliseconds since UNIX epoch.
type Timestamp = number;

function now(): Timestamp {
    return fromJSDate(new Date());
}

function fromJSDate(date: Date): Timestamp {
    return date.valueOf();
}

// Parse a timestamp using the same code as Date.parse() (and the constructor).
function parse(text: string, allowEmpty: boolean = true, raiseOnError: boolean = true): Timestamp | undefined {
    text = text.trim();
    if (allowEmpty && (text.length == 0)) {
        return undefined;
    }

    let value = new Date(text);
    if (Number.isNaN(value.valueOf())) {
        if (raiseOnError) {
            throw new Error(`Cannot parse timestamp: '${text}'.`);
        }

        return undefined;
    }

    return fromJSDate(value);
}

// Convert the timestamp to a string for display.
// Pretty output is not guaranteed to be parseable back to a timestamp.
function timestampToString(
        timestamp: Timestamp | string,
        pretty: boolean = false,
        locale: string = DEFAUT_LOCALE,
        timezone: string | undefined = undefined,
        ): string {
    const datetime = new Date(parseInt(timestamp.toString()));

    if ((timezone == null) && (testing.runtime.isTestingMode())) {
        timezone = TESTING_TIME_ZONE;
    }

    if (pretty) {
        return datetime.toLocaleString(locale, {timeZone: timezone});
    }

    return datetime.toISOString();
}

// Like timestampToString(), but only display date (not time) information.
// By default (non-pretty with no locale), the output will be of the format: `YYYY-MM-DD`.
function datestampToString(
        timestamp: Timestamp | string,
        pretty: boolean = false,
        locale: string = DEFAUT_LOCALE,
        timezone: string | undefined = undefined,
        ): string {
    const datetime = new Date(parseInt(timestamp.toString()));

    if ((timezone == null) && (testing.runtime.isTestingMode())) {
        timezone = TESTING_TIME_ZONE;
    }

    if (pretty) {
        return datetime.toLocaleDateString(locale, {timeZone: timezone});
    }

    return datetime.toLocaleDateString(DEFAUT_LOCALE, {timeZone: timezone});
}

// Find timestamps within some text and replace them with the pretty version.
// Timestamps must be embedded as: '<timestamp:123>' where '123' is the timestamp.
function embededTimestampsToString(
        text: any,
        pretty: boolean = false,
        locale: string = DEFAUT_LOCALE,
        timezone: string | undefined = undefined,
        ): string {
    if (text == null) {
        return '';
    }

    text = text.toString();

    return text.replace(/<timestamp:\s*(-?\d+)\s*>/g, function(match: any, timestamp: any) {
        return timestampToString(parseInt(timestamp), pretty, locale, timezone);
    });
}

export {
    MSECS_PER_SECS,
    MSECS_PER_MINS,
    MSECS_PER_HOURS,
    MSECS_PER_DAYS,

    DEFAUT_LOCALE,

    Timestamp,

    now,
    fromJSDate,
    parse,
    embededTimestampsToString,
    timestampToString,
    datestampToString,
}

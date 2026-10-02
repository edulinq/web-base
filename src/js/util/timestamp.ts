import * as testing from '../testing/index';

const MSECS_PER_SECS: number = 1000
const MSECS_PER_MINS: number = MSECS_PER_SECS * 60
const MSECS_PER_HOURS: number = MSECS_PER_MINS * 60
const MSECS_PER_DAYS: number = MSECS_PER_HOURS * 24

const TESTING_LOCALE: string = 'en-US';
const TESTING_TIME_ZONE: string = 'UTC';

// Timestamps are milliseconds since UNIX epoch.
type Timestamp = number;

// Find timestamps within some text and replace them with the pretty version.
function embededTimestampsToPretty(text: any): string {
    if (text == null) {
        return '';
    }

    text = text.toString();

    return text.replace(/<timestamp:\s*(-?\d+)\s*>/g, function(match: any, timestamp: any) {
        return timestampToPretty(parseInt(timestamp));
    });
}

function timestampToPretty(timestamp: Timestamp): string {
    const date = new Date(timestamp);

    // Return a timestamp in a standard locale and time zone for testing consistency.
    if (testing.runtime.isTestingMode()) {
        return date.toLocaleString(TESTING_LOCALE, {
            timeZone: TESTING_TIME_ZONE,
        });
    }

    return date.toLocaleString();
}

export {
    MSECS_PER_SECS,
    MSECS_PER_MINS,
    MSECS_PER_HOURS,
    MSECS_PER_DAYS,

    embededTimestampsToPretty,
    timestampToPretty,
}

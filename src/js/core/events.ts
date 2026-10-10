import * as objects from '../util/objects'

// A package to listen for custom events (i.e., a pub/sub framework).
// An event listener listens for custom events with the same name as the listener to be dispatched.
// All custom events may provide additional details.
// To listen for a specific event within an event type, provide additional event details.
// Every key-value pair in the provided query details must be matched in the target details.
// To check for object equality, edq.util.objects.deepEqual() is used.

// All the current listeners for events.
// Keyed on the listener's symbol.
const eventListeners: Map<Symbol, EventListener> = new Map();

// An element (not in the current document) that we use for listening for and dispatching events.
const eventElement = document.createElement(`div`);

const DEFAULT_TIMEOUT_MS: number = 3000;

type EventCallback = (event: Event) => void;

// A basic representation of an event.
// This class serves as both an event that was captured,
// and a query to match a dispatched event.
class EventInfo {
    name: string;
    details: Record<string, any>;

    // The event that this infor was created from (if it was created from an event).
    source: Event | undefined;

    constructor(name: string, details: Record<string, any> = {}, source: Event | undefined = undefined) {
        if (details == null) {
            details = {};
        }

        this.name = name;
        this.details = details;
        this.source = source;
    }

    // Check if this event matches the given query.
    // Note that this is not an equality check.
    // A query matches if its name matches,
    // and any details present in the query match the target.
    // A target event can have more details (not present in the query) and still match.
    match(query: EventInfo): boolean {
        if (this.name !== query.name) {
            return false;
        }

        for (const [key, value] of Object.entries(query.details)) {
            if (!Object.hasOwn(this.details, key)) {
                return false;
            }

            if (!objects.deepEqual(this.details[key], value)) {
                return false;
            }
        }

        return true;
    }

    static fromEvent(event: Event): EventInfo {
        let details = {};
        if (event.constructor.name === 'CustomEvent') {
            details = (event as CustomEvent).detail;
        }

        return new EventInfo(event.type, details, event);
    }
}

// A representation of a specific instance of waiting for an event.
// A listener will start listening as soon as it is constructed.
class EventListener {
    id: Symbol;
    query: EventInfo;

    promise: Promise<Event>;

    // The resolve callback for the promise.
    // When `undefined`, it has not yet been set.
    // When `null`, the promise has already been resolved.
    resolve: EventCallback | null | undefined;

    // The timeout ID (from setTimeout()), if a timeout was set.
    timeoutID: number | undefined = undefined;

    // Make a closure to ensure the event callback has access to this object.
    eventClosure: EventCallback;

    constructor(query: EventInfo, timeout: number | undefined) {
        this.id = Symbol('EventListener');
        this.query = query;
        this.resolve = undefined;
        this.timeoutID = undefined;

        const self = this;

        this.eventClosure = function(event: Event) {
            self.matchAndResolve(event);
        }

        eventListeners.set(this.id, this);

        this.promise = new Promise<Event>(function(resolve, reject) {
            self.resolve = resolve;

            if (timeout != null) {
                self.timeoutID = setTimeout(function() {
                    self.remove();
                    reject(new Error(`Event Timeout: '${self.query.name}' timed out after ${timeout}ms.`));
                }, timeout);
            }

            eventElement.addEventListener(self.query.name, self.eventClosure);
        });
    }

    // Stop listening and remove this listener from the collection of listeners.
    // Promises will not be settled.
    remove() {
        eventElement.removeEventListener(this.query.name, this.eventClosure);
        eventListeners.delete(this.id);

        this.clearTimeout();
        this.resolve = null;
    }

    clearTimeout() {
        if (this.timeoutID === undefined) {
            return;
        }

        clearTimeout(this.timeoutID);
        this.timeoutID = undefined;
    }

    // If the given event matches this listener, then resolve the promise.
    matchAndResolve(event: Event) {
        // No resolve function means that this listener has already resolved its promise.
        if (this.resolve == null) {
            return;
        }

        let targetEventInfo = EventInfo.fromEvent(event);
        if (!targetEventInfo.match(this.query)) {
            return;
        }

        let resolve = this.resolve;
        this.remove();
        resolve(event);
    }
}

// Dispatch an event.
// All listeners that match this event will be triggered.
function dispatchEvent(eventInfo: EventInfo) {
    eventElement.dispatchEvent(new CustomEvent(eventInfo.name, {detail: eventInfo.details}));
}

// Return a promise that resolves when a matching event is dispatched.
// If a timeout is specified, then the promise rejects if the event is not found within the timeout milliseconds.
// Only the first matched event will be resolved.
function getEventPromise(query: EventInfo, timeout: number | undefined = DEFAULT_TIMEOUT_MS): Promise<Event> {
    let listener = new EventListener(query, timeout);
    return listener.promise;
}

// Remove all listeners from the event listeners map.
function removeAllListeners() {
    for (const listener of eventListeners.values()) {
        listener.remove();
    }
}

// Cleanup all listeners that match the query.
function removeListeners(query: EventInfo) {
    for (const listener of eventListeners.values()) {
        if (listener.query.match(query)) {
            listener.remove();
        }
    }
}

// Get a count of listeners for each event name.
function getListenerCounts(): Record<string, number> {
    let counts: Record<string, number> = {};
    for (const listener of eventListeners.values()) {
        let key = listener.query.name;
        if (!(key in counts)) {
            counts[key] = 0;
        }

        counts[key]++;
    }

    return counts;
}

export {
    EventInfo,

    dispatchEvent,
    getEventPromise,
    removeAllListeners,
    removeListeners,

    getListenerCounts,
};

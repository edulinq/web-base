import * as events from './events';

const TEST_EVENT_NAME: string = 'test-event';

test("getEventPromise() base", function() {
    events.removeAllListeners();

    const eventInfo = new events.EventInfo(TEST_EVENT_NAME);
    const promise = events.getEventPromise(eventInfo);

    events.dispatchEvent(eventInfo);

    return promise.then(function(event) {
        const newEventInfo = events.EventInfo.fromEvent(event);

        expect(newEventInfo.name).toBe(eventInfo.name);
        expect(newEventInfo.details).toStrictEqual(eventInfo.details);
        expect(newEventInfo.source).toBe(event);
    });
})

test("getEventPromise() query", function() {
    events.removeAllListeners();

    const query = new events.EventInfo(TEST_EVENT_NAME, {'a': 1});
    const promise = events.getEventPromise(query);

    const eventInfo = new events.EventInfo(TEST_EVENT_NAME, {'a': 1, 'b': 2});
    events.dispatchEvent(eventInfo);

    return promise.then(function(event) {
        const newEventInfo = events.EventInfo.fromEvent(event);

        expect(newEventInfo.name).toBe(eventInfo.name);
        expect(newEventInfo.details).toStrictEqual(eventInfo.details);
        expect(newEventInfo.source).toBe(event);
    });
})

// Ensure that a listener removes itself right before the promise resolves.
test("getEventPromise() remove self", function() {
    events.removeAllListeners();
    expect(events.getListenerCounts()).toStrictEqual({});

    const eventInfo = new events.EventInfo(TEST_EVENT_NAME);
    const promise = events.getEventPromise(eventInfo);

    events.dispatchEvent(eventInfo);

    return promise.then(function(event) {
        expect(events.getListenerCounts()).toStrictEqual({});
    });
})

test("removeAllListeners() base", function() {
    events.removeAllListeners();
    expect(events.getListenerCounts()).toStrictEqual({});

    const eventInfo = new events.EventInfo(TEST_EVENT_NAME);

    events.getEventPromise(eventInfo, undefined);
    expect(events.getListenerCounts()).toStrictEqual({[TEST_EVENT_NAME]: 1});

    events.removeAllListeners();
    expect(events.getListenerCounts()).toStrictEqual({});
})

test("removeListeners() base", function() {
    events.removeAllListeners();
    expect(events.getListenerCounts()).toStrictEqual({});

    const eventInfoA = new events.EventInfo(TEST_EVENT_NAME + '-a');
    const eventInfoB = new events.EventInfo(TEST_EVENT_NAME + '-b');

    events.getEventPromise(eventInfoA, undefined);
    events.getEventPromise(eventInfoB, undefined);
    expect(events.getListenerCounts()).toStrictEqual({
        [eventInfoA.name]: 1,
        [eventInfoB.name]: 1,
    });

    events.removeListeners(eventInfoA);
    expect(events.getListenerCounts()).toStrictEqual({
        [eventInfoB.name]: 1,
    });

    events.removeListeners(eventInfoB);
    expect(events.getListenerCounts()).toStrictEqual({});

    events.removeAllListeners();
    expect(events.getListenerCounts()).toStrictEqual({});
})

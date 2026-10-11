import * as routing from './routing';
import * as log from './log';

let testHandlerCounts: Record<string, number> = {};

function testHandler(request: routing.RoutingRequest) {
    if (!(request.path in testHandlerCounts)) {
        testHandlerCounts[request.path] = 0;
    }

    testHandlerCounts[request.path]++;
}

const testRoutes: Array<routing.Route> = [
    new routing.StringRoute('', testHandler),
    new routing.StringRoute('index', testHandler),
    new routing.StringRoute('foo/bar', testHandler),
];

const testPaths: Array<string> = [
    '',
    '#?a=abc',

    'index',
    'foo/bar',

    'index?a=abc',
    'index?a=abc&b=123',

    '?a=abc',
    '#',
];

const testRoutesHandlerCounts: Record<string, number> = {
    '': 4,
    'index': 3,
    'foo/bar': 1,
};

describe("RoutingRequest parse() and toString() base", function() {
    // [[raw input, expected toString, expected parse output], ...]
    const testCases: Array<[string, string, routing.RoutingRequest]> = [
        // Empty
        ['', '#', new routing.RoutingRequest('', {})],
        ['#', '#', new routing.RoutingRequest('', {})],
        ['/', '#', new routing.RoutingRequest('', {})],
        ['/#', '#', new routing.RoutingRequest('', {})],
        ['?', '#', new routing.RoutingRequest('', {})],

        // Base
        ['index', '#index', new routing.RoutingRequest('index', {})],
        ['#index', '#index', new routing.RoutingRequest('index', {})],
        ['index/', '#index', new routing.RoutingRequest('index', {})],
        ['/index', '#index', new routing.RoutingRequest('index', {})],
        ['/index/', '#index', new routing.RoutingRequest('index', {})],
        ['index.html', '#index.html', new routing.RoutingRequest('index.html', {})],
        ['index.html/', '#index.html', new routing.RoutingRequest('index.html', {})],
        ['/index.html', '#index.html', new routing.RoutingRequest('index.html', {})],
        ['/index.html/', '#index.html', new routing.RoutingRequest('index.html', {})],

        // Path
        ['index/foo', '#index/foo', new routing.RoutingRequest('index/foo', {})],
        ['index/foo/', '#index/foo', new routing.RoutingRequest('index/foo', {})],
        ['index/foo/bar', '#index/foo/bar', new routing.RoutingRequest('index/foo/bar', {})],

        // Params
        ['index?a=abc', '#index?a=abc', new routing.RoutingRequest('index', {a: 'abc'})],
        ['index?b=123&a=abc', '#index?a=abc&b=123', new routing.RoutingRequest('index', {a: 'abc', b: '123'})],
        ['?a=abc', '#?a=abc', new routing.RoutingRequest('', {a: 'abc'})],
        ['#?a=abc', '#?a=abc', new routing.RoutingRequest('', {a: 'abc'})],

        // All
        ['/index/foo/bar?a=abc&b=123', '#index/foo/bar?a=abc&b=123', new routing.RoutingRequest('index/foo/bar', {a: 'abc', b: '123'})],
    ];

    test.each(testCases)("'%s'", function(input, expectedToString, expectedObject) {
        let actualObject = routing.RoutingRequest.parse(input);
        let actualToString = actualObject.toString();
        let newObject = routing.RoutingRequest.parse(actualToString);

        // Check the direct parse.
        expect(actualObject).toStrictEqual(expectedObject);

        // Check toString().
        expect(actualToString).toBe(expectedToString);

        // Check the reconstructed object.
        expect(newObject).toStrictEqual(actualObject);
    });
});

describe("StringRoute.match() base", function() {
    // [[path, request, expected], ...]
    const testCases: Array<[string, routing.RoutingRequest, boolean]> = [
        // Empty
        ['', new routing.RoutingRequest('', {}), true],
        ['index', new routing.RoutingRequest('', {}), false],
        ['', new routing.RoutingRequest('index', {}), false],

        // Base
        ['index', new routing.RoutingRequest('index', {}), true],
        ['ZZZ', new routing.RoutingRequest('index', {}), false],
        ['index', new routing.RoutingRequest('ZZZ', {}), false],

        // Path
        ['index/foo', new routing.RoutingRequest('index', {}), false],
        ['index', new routing.RoutingRequest('index/foo', {}), false],

        // Params
        ['index', new routing.RoutingRequest('index', {'a': 'abc'}), true],
        ['ZZZ', new routing.RoutingRequest('index', {'a': 'abc'}), false],
        ['index', new routing.RoutingRequest('ZZZ', {'a': 'abc'}), false],
    ];

    test.each(testCases)("('%s', %s)", function(path, request, expected) {
        let route = new routing.StringRoute(path, testHandler);
        expect(route.match(request)).toBe(expected);
    });
});

describe("RegexRoute.match() base", function() {
    // [[pattern, request, expected], ...]
    const testCases: Array<[RegExp, routing.RoutingRequest, boolean]> = [
        // Empty
        [new RegExp(''), new routing.RoutingRequest('', {}), true],
        [/index/, new routing.RoutingRequest('', {}), false],
        [new RegExp(''), new routing.RoutingRequest('index', {}), true],

        // Base
        [/index/, new routing.RoutingRequest('index', {}), true],
        [/ZZZ/, new routing.RoutingRequest('index', {}), false],
        [/index/, new routing.RoutingRequest('ZZZ', {}), false],
        [/abc/, new routing.RoutingRequest('___abc___', {}), true],

        // Path
        [/index\/foo/, new routing.RoutingRequest('index', {}), false],
        [/^index$/, new routing.RoutingRequest('index/foo', {}), false],

        // Params
        [/index/, new routing.RoutingRequest('index', {'a': 'abc'}), true],
        [/ZZZ/, new routing.RoutingRequest('index', {'a': 'abc'}), false],
        [/index/, new routing.RoutingRequest('ZZZ', {'a': 'abc'}), false],
    ];

    test.each(testCases)("('%s', %s)", function(pattern, request, expected) {
        let route = new routing.RegexRoute(pattern, testHandler);
        expect(route.match(request)).toBe(expected);
    });
});

test("route() with path", function() {
    routing.stop();
    routing.clearRoutes();
    testHandlerCounts = {};

    for (const route of testRoutes) {
        routing.addRoute(route);
    }

    for (const path of testPaths) {
        routing.route(path);
    }

    expect(testHandlerCounts).toStrictEqual(testRoutesHandlerCounts);

    routing.clearRoutes();
    testHandlerCounts = {};
});

test("route() with request", function() {
    routing.stop();
    routing.clearRoutes();
    testHandlerCounts = {};

    for (const route of testRoutes) {
        routing.addRoute(route);
    }

    for (const path of testPaths) {
        let request = routing.RoutingRequest.parse(path);
        routing.route(request);
    }

    expect(testHandlerCounts).toStrictEqual(testRoutesHandlerCounts);

    routing.clearRoutes();
    testHandlerCounts = {};
});

test("route() with hash", function() {
    routing.stop();
    routing.clearRoutes();
    testHandlerCounts = {};

    for (const route of testRoutes) {
        routing.addRoute(route);
    }

    for (let path of testPaths) {
        if (!path.startsWith('#')) {
            path = '#' + path;
        }

        window.location.hash = path;
        routing.route();
    }

    expect(testHandlerCounts).toStrictEqual(testRoutesHandlerCounts);

    routing.clearRoutes();
    testHandlerCounts = {};
});

test("route() skip current location", function() {
    routing.stop();
    routing.clearRoutes();
    testHandlerCounts = {};

    for (const route of testRoutes) {
        routing.addRoute(route);
    }

    routing.route('index');
    routing.route('#index');
    routing.route('/index');
    routing.route('index?');

    let expected = {
        'index': 1,
    };

    expect(testHandlerCounts).toStrictEqual(expected);

    routing.clearRoutes();
    testHandlerCounts = {};
});

test("not found base", function() {
    routing.stop();
    routing.clearRoutes();
    testHandlerCounts = {};

    // Set the log levels.
    const oldConsoleLevel = log.setLevel(log.LEVEL_OFF);
    const oldStorageLevel = log.setStorageLevel(log.LEVEL_WARN);

    for (const route of testRoutes) {
        routing.addRoute(route);
    }

    log.clearRecords();
    expect(log.getRecords().length).toBe(0);
    routing.route('somewhere/else');
    expect(log.getRecords().length).toBe(1);

    routing.stop();
    routing.setNotFound(testHandler);

    log.clearRecords();
    expect(log.getRecords().length).toBe(0);
    routing.route('somewhere/else');
    expect(log.getRecords().length).toBe(1);

    // Reset the log levels.
    log.setLevel(oldConsoleLevel);
    log.setStorageLevel(oldStorageLevel);

    let expected = {
        'somewhere/else': 1,
    };

    expect(testHandlerCounts).toStrictEqual(expected);

    routing.clearRoutes();
    testHandlerCounts = {};
});

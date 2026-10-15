// Simple SPA routing infrastructure.
// Routing in this project is based only around hash paths.
// After init() is called, routing will happen whenever the URL hash/fragment is changed.
// The first route matched (determined by when addRoute() was called for each route) will be called.
// Users should make sure to register their own not found handler (404) via setNotFound() in addition to setting their routes.

import * as events from './events';
import * as log from './log';
import * as objects from '../util/objects';

const EVENT_ROUTING_START: string = 'routing-start';
const EVENT_ROUTING_END: string = 'routing-end';

// The currently routed location.
// This should only be undefined before the initial route,
// and this should only be out-of-date between the hash being changed and the change event being caught.
let currentRequest: RoutingRequest | undefined = undefined;

let notFoundHandler: RoutingHandler = defaultNotFound;

let routes: Array<Route> = [];

// Handler function to use when a route has been selected.
type RoutingHandler = (request: RoutingRequest) => void;

// A request to route to some location.
// This contains all the information present when deciding where to route.
class RoutingRequest {
    // The path component of the hash (without parameters).
    // The path should never start with a hash or slash.
    path: string;

    // The URL params for this request.
    params: Record<string, string>;

    constructor(path: string, params: Record<string, string> = {}) {
        this.path = path;
        this.params = params;
    }

    // Parse a request out of a path.
    static parse(rawPath: string): RoutingRequest {
        rawPath = basicPathClean(rawPath);

        // Parse the raw path as a url to pull out parameters.
        let url = URL.parse(rawPath, 'http://localhost');
        if (url == null) {
            throw new Error(`Unable to parse URL: '${rawPath}'.`);
        }

        // Pull out the path (which comes with a leading slash).
        let path = url.pathname.replace(/^\//, '');

        // Pull out the params into a simple object.
        let rawParams = url.searchParams;
        rawParams.sort();

        let params: Record<string, string> = {};
        for (const [key, value] of rawParams.entries()) {
            params[key] = value;
        }

        return new RoutingRequest(path, params);
    }

    // Create the canonical string representation of this routing request.
    // The output will always start with a hash.
    toString(): string {
        // Create a fake URL for parsing and formatting.
        let url = URL.parse(this.path, 'http://localhost');
        if (url == null) {
            throw new Error(`Unable to parse URL: '${this.path}'.`);
        }

        // Add the params.
        for (const [key, value] of Object.entries(this.params)) {
            url.searchParams.append(key, value);
        }

        // Sort the params.
        url.searchParams.sort();

        // Pull out the path (which comes with a leading slash).
        let path = url.pathname.replace(/^\//, '');

        // Add on the params
        // (empty if there are none and includes the leading '?' if there are).
        path += url.search;

        return '#' + path;
    }
}

// The base class for locations that the router can match against and then route to.
abstract class Route {
    protected handler: RoutingHandler;

    constructor(handler: RoutingHandler) {
        this.handler = handler;
    }

    getHandler(): RoutingHandler {
        return this.handler;
    }

    // See if this route matches the given request.
    abstract match(request: RoutingRequest): boolean;
}

// A route that matches a request's path using simple (strict) string comparison.
class StringRoute extends Route {
    path: string;

    constructor(path: string, handler: RoutingHandler) {
        super(handler);

        this.path = path;
    }

    match(request: RoutingRequest): boolean {
        return (request.path === this.path);
    }
}

// A route that matches a request's path using a regular expression.
class RegexRoute extends Route {
    pattern: RegExp;

    // When true, match against a request's toString().
    // otherwise match against a request's path.
    matchFullRequest: boolean;

    constructor(pattern: RegExp, handler: RoutingHandler, matchFullRequest: boolean = true) {
        super(handler);

        this.pattern = pattern;
        this.matchFullRequest = matchFullRequest;
    }

    match(request: RoutingRequest): boolean {
        let matchTarget = request.path;
        if (this.matchFullRequest) {
            matchTarget = request.toString();
        }

        return (matchTarget.match(this.pattern) != null);
    }
}

// A route that wraps an existing route, but also sets nav highlights (according to EduLinq styling).
class NavRoute extends Route {
    navTarget: string;

    route: Route;

    constructor(navTarget: string, route: Route) {
        super(function(request: RoutingRequest) {
            navHandlerWrapper(navTarget, route, request);
        });

        this.navTarget = navTarget;
        this.route = route;
    }

    match(request: RoutingRequest): boolean {
        return this.route.match(request);
    }
}

// Handle standard navigation before calling the route's handler.
function navHandlerWrapper(navTarget: string, route: Route, request: RoutingRequest) {
    // Deselect and current nav highlights.
    for (const element of document.querySelectorAll('.nav-item.nav-highlight')) {
        element.classList.remove('nav-highlight');
    }

    // Add the new nav highlight.
    let navItem = document.querySelector(`.nav-item[data-target='${navTarget}']`);
    if (navItem != null) {
        navItem.classList.add('nav-highlight');
    }

    // Call the existing handler.
    route.getHandler()(request);
}

// Initialize routing.
function init() {
    currentRequest = undefined;
    window.addEventListener("hashchange", routeFromEvent);
}

// Stop watching for hash changes.
function stop() {
    window.removeEventListener("hashchange", routeFromEvent);
    currentRequest = undefined;
}

function routeFromEvent() {
    route();
}

// Route to a specified target.
// If no target is specified, use window.location.hash.
function route(request: string | RoutingRequest | undefined = undefined) {
    if (request == null) {
        request = getLocationHash();
    }

    if (typeof(request) == 'string') {
        request = RoutingRequest.parse(request);
    }

    // Skip routing if the current request matches this one.
    if ((currentRequest != null) && objects.deepEqual(currentRequest, request)) {
        return;
    }

    // Set the current request and window hash (which will be set using the canonical request representation).
    currentRequest = request;
    window.location.hash = request.toString();

    // Find a matching route/handler.
    let handler: RoutingHandler | undefined = undefined;
    for (const route of routes) {
        if (route.match(request)) {
            handler = route.getHandler();
            break;
        }
    }

    // No matching route was found, fallback to the default.
    if (handler == null) {
        log.warn(`Could not find matching route. Falling back to the default route.`, request);
        handler = notFoundHandler;
    }

    // Call the handler.

    events.dispatch(new events.EventInfo(EVENT_ROUTING_START, {
        'path': request.path,
        'params': request.params,
    }));

    handler(request);

    events.dispatch(new events.EventInfo(EVENT_ROUTING_END, {
        'path': request.path,
        'params': request.params,
    }));
}

function addRoute(route: Route) {
    routes.push(route);
}

// Clear all added routes.
function clearRoutes() {
    routes = [];
}

// The default not found (404) behavior.
function defaultNotFound(request: RoutingRequest) {
    // noop
}

// Set the fallback handler no path is found, and return the old one.
function setNotFound(handler: RoutingHandler): RoutingHandler {
    let oldHandler = notFoundHandler;
    notFoundHandler = handler;
    return oldHandler;
}

// Return a standardized location that always has as leading hash.
function getLocationHash(): string {
    let hash = window.location.hash.trim();

    if (hash.length === 0) {
        return '#';
    }

    return hash;
}

// Perform basic cleaning (but no parsing) of a path.
// The output of this will not start with a space, slash, or hash.
function basicPathClean(path: string): string {
    path = path.trim();

    // Remove leading hashes, slashes, and spaces.
    path = path.replace(/^[\s\/#]+/, '');

    // Remove tailing slashes and spaces.
    path = path.replace(/[\/\s]+$/, '');

    return path;
}

export {
    EVENT_ROUTING_START,
    EVENT_ROUTING_END,

    RoutingHandler,
    RoutingRequest,
    Route,
    StringRoute,
    RegexRoute,
    NavRoute,

    init,
    stop,

    route,
    addRoute,
    clearRoutes,
    setNotFound,
}

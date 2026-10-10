// See: https://developer.mozilla.org/en-US/docs/Glossary/Primitive
function isPrimitive(value: any): boolean {
    return (value == null) || ((typeof(value) !== 'object') && !isFunction(value));
}

function isFunction(value: any): boolean {
    return (typeof(value) === 'function');
}

function isArray(value: any): boolean {
    return (Object.prototype.toString.call(value) === "[object Array]");
}

// Check if the given value is a object-object (e.g., not an array).
function isObject(value: any): boolean {
    return (Object.prototype.toString.call(value) === "[object Object]");
}

// Check if two objects are deeply equals.
// This is a simple implementation that is not extremely robust or performant.
// This does not handle cycles (e.g., an object pointing to itself).
// Functions will only be check if they reference the same function (not content).
function deepEqual(a: any, b: any): boolean {
    // Check for identity.
    if (a === b) {
        return true;
    }

    // If either object is a function (and are not the same (per the above identity check)),
    // then consider them unequal.
    if (isFunction(a) || isFunction(b)) {
        return false;
    }

    // Check for primitives.
    let aIsPrimitive = isPrimitive(a);
    let bIsPrimitive = isPrimitive(b);

    if (aIsPrimitive !== bIsPrimitive) {
        return false;
    }

    if (aIsPrimitive && bIsPrimitive) {
        return (a === b);
    }

    // The number of keys/properties must match.
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
    }

    // Check each property/key.
    for (const key of Object.keys(a)) {
        if (!(key in b)) {
            return false;
        }

        if (!deepEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

export {
    isPrimitive,
    isFunction,
    isArray,
    isObject,

    deepEqual
}

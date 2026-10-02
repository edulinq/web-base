import * as runtime from './runtime.js';

function init() {
    runtime.setTestingMode(true);
}

beforeEach(function() {
    init();
});

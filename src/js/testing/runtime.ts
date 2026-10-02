let _testingMode: boolean = false;

function isTestingMode(): boolean {
    return _testingMode;
}

function setTestingMode(value: boolean) {
    _testingMode = value;
}

export {
    isTestingMode,
    setTestingMode,
}

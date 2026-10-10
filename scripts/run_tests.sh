#!/bin/bash

# Run tests.

readonly THIS_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd | xargs realpath)"
readonly ROOT_DIR="${THIS_DIR}/.."

readonly WORK_DIR="${ROOT_DIR}/.test-build"
readonly SOURCE_DIR="${ROOT_DIR}/src"

readonly ESBUILD_BIN="${ROOT_DIR}/node_modules/.bin/esbuild"
readonly JEST_BIN="${ROOT_DIR}/node_modules/jest/bin/jest.js"

function main() {
    set -e
    trap exit SIGINT

    shopt -s globstar

    cd "${ROOT_DIR}"

    # Cleanup before build.
    rm -rf "${WORK_DIR}"
    mkdir "${WORK_DIR}"

    # Transpile Typescript.
    "${ESBUILD_BIN}" "${SOURCE_DIR}"/js/**/*.ts --outdir="${WORK_DIR}"

    # Run tests.
    node --experimental-vm-modules "${JEST_BIN}" $@

    return 0
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"

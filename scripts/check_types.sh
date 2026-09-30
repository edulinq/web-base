#!/bin/bash

# Check types.

readonly THIS_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd | xargs realpath)"
readonly ROOT_DIR="${THIS_DIR}/.."

readonly SOURCE_DIR="${ROOT_DIR}/src"

readonly TSC_BIN="${ROOT_DIR}/node_modules/.bin/tsc"

function main() {
    if [[ $# -ne 0 ]]; then
        echo "USAGE: $0"
        exit 1
    fi

    set -e
    trap exit SIGINT

    shopt -s globstar

    cd "${ROOT_DIR}"

    "${TSC_BIN}" --noEmit --types jest "${SOURCE_DIR}"/js/**/*.ts

    return 0
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"

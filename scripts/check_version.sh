#!/bin/bash

# Compare the versions in package.json and src/js/index.js.

readonly THIS_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd | xargs realpath)"
readonly ROOT_DIR="${THIS_DIR}/.."
readonly PACKAGE_PATH="${ROOT_DIR}/package.json"
readonly MAIN_PATH="${ROOT_DIR}/src/js/index.ts"

function main() {
    if [[ $# -ne 0 ]]; then
        echo "USAGE: $0"
        exit 1
    fi

    trap exit SIGINT

    local package_version=$(grep '"version"' "${PACKAGE_PATH}" | sed 's/^.*": "\(.*\)",$/\1/')
    local main_version=$(grep '^const VERSION' "${MAIN_PATH}" | sed "s/^.* = '\\(.*\\)';$/\1/")

    if [[ "${package_version}" != "${main_version}" ]] ; then
        echo "Version mismatch. Package version: '${package_version}', Index Version: '${main_version}'."
        return 1
    fi

    return 0
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"

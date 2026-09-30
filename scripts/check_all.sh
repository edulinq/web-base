#!/bin/bash

# Perform all the checks in CI in one script.

readonly THIS_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd | xargs realpath)"
readonly ROOT_DIR="${THIS_DIR}/.."

function main() {
    if [[ $# -ne 0 ]]; then
        echo "USAGE: $0"
        exit 1
    fi

    trap exit SIGINT

    cd "${ROOT_DIR}"

    local error_count=0

    echo "Checking Package Version"
    "${THIS_DIR}/check_version.sh"
    ((error_count += $?))

    echo -e "\nChecking Types"
    "${THIS_DIR}/check_types.sh"
    ((error_count += $?))

    echo -e "\nBuild Dev"
    "${THIS_DIR}/build.sh"
    ((error_count += $?))

    echo -e "\nBuild Prod"
    "${THIS_DIR}/build.sh" --prod
    ((error_count += $?))

    echo -e "\nRunning Tests"
    "${THIS_DIR}/run_tests.sh"
    ((error_count += $?))

    echo "---"
    if [[ ${error_count} -gt 0 ]] ; then
        echo "Found ${error_count} issues."
    else
        echo "No issues found."
    fi

    return ${error_count}
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"

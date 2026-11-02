#!/bin/bash

# Compile icons into a JS file in the source directory.
#
# Icon SVG files should have just XML header and an SVG tag.
# Both will be stripped when the icon is placed into JS.
# The SVGs will be handled as normal text, so try to stay consistent with existing (working) icons.

readonly THIS_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd | xargs realpath)"
readonly ROOT_DIR="${THIS_DIR}/.."

readonly SOURCE_DIR="${ROOT_DIR}/src"

readonly ICONS_SOURCE_DIR="${SOURCE_DIR}/images/icons"
readonly ICONS_OUT_PATH="${SOURCE_DIR}/js/render/icons-data.ts"

function main() {
    if [[ $# -ne 0 ]]; then
        echo "USAGE: $0"
        exit 1
    fi

    set -e
    trap exit SIGINT

    echo "// Automatically generated file, do not modify manually." > "${ICONS_OUT_PATH}"
    echo "// See scripts/compile_icons.sh" >> "${ICONS_OUT_PATH}"
    echo "" >> "${ICONS_OUT_PATH}"
    echo "import * as icons from './icons'" >> "${ICONS_OUT_PATH}"
    echo "" >> "${ICONS_OUT_PATH}"

    for path in "${ICONS_SOURCE_DIR}"/*.svg ; do
        local baseName=$(basename "${path}" | sed 's/.svg$//')
        local text=$(cat "${path}" | sed 's/<\/\?\(svg\|?xml\)[^>]*>//' | tr '\n' ' ' | sed 's/\s\+/ /g')

        echo "icons.addIcon('${baseName}', '${text}');" >> "${ICONS_OUT_PATH}"
    done

    return 0
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"

#!/bin/bash

# Compile all project CSS files to $CSS_OUT_PATH.
#
# This will include automatically generating some rules.
# Will define: `.theme-primary`, `.theme-secondary`, `.theme-accent`, and `.theme-error`.

readonly URL='https://github.com/edulinq/web-base'

readonly THIS_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd | xargs realpath)"
readonly ROOT_DIR="${THIS_DIR}/.."

readonly SOURCE_DIR="${ROOT_DIR}/src"
readonly BUILD_DIR="${ROOT_DIR}/build"

readonly JS_INDEX_PATH="${SOURCE_DIR}/js/index.ts"

readonly CSS_OUT_PATH="${BUILD_DIR}/css/edq.css"
readonly CSS_PATHS=(
    "${SOURCE_DIR}/css/constants.css"
    "${SOURCE_DIR}/vendor/normalize.css"
    "${SOURCE_DIR}/vendor/prismjs/prism-dark.css"
    "${SOURCE_DIR}/vendor/prismjs/prism-light.css"
    "${SOURCE_DIR}/css/brightness.css"
    "${SOURCE_DIR}/css/icons.css"
    "${SOURCE_DIR}/css/util.css"
    "${SOURCE_DIR}/css/base-elements.css"
    "${SOURCE_DIR}/css/layout.css"
    "${SOURCE_DIR}/css/fields.css"
    "${SOURCE_DIR}/css/table.css"
    "${SOURCE_DIR}/css/cards.css"
    "${SOURCE_DIR}/css/misc.css"
)

readonly AUTO_THEME_PREFIXES=(
    '.theme-primary'
    '.theme-secondary'
    '.theme-primary .theme-secondary'
    '.theme-primary .theme-secondary .theme-primary'
    '.theme-primary .theme-secondary .theme-primary .theme-secondary'
)

function main() {
    if [[ $# -ne 0 ]]; then
        echo "USAGE: $0"
        exit 1
    fi

    set -e
    trap exit SIGINT

    cd "${ROOT_DIR}"

    # Fetch version.
    local version=$(grep 'const VERSION' "${JS_INDEX_PATH}" | sed "s/^const VERSION = '\(.*\)';$/\1/")
    local versionMessage="EduLinq Web Base v${version}. ${URL}"

    # Concat CSS into a single file.
    mkdir -p $(dirname "${CSS_OUT_PATH}")
    echo -e "/* ${versionMessage} */\n" | cat - "${CSS_PATHS[@]}" > "${CSS_OUT_PATH}"

    # Build some automatic rules.
    echo "" >> "${CSS_OUT_PATH}"
    echo "/* Generated Rules */" >> "${CSS_OUT_PATH}"

    for prefix in "${AUTO_THEME_PREFIXES[@]}" ; do
        local base=$(echo "${prefix}" | sed 's/.*-\(\w\+\)$/\1/')

        # Normal
        echo "" >> "${CSS_OUT_PATH}"
        echo "${prefix} {" >> "${CSS_OUT_PATH}"
        echo "    background-color: var(--color-${base}-bg);" >> "${CSS_OUT_PATH}"
        echo "    color: var(--color-${base}-text);" >> "${CSS_OUT_PATH}"
        echo "    fill: var(--color-${base}-text);" >> "${CSS_OUT_PATH}"
        echo "    stroke: var(--color-${base}-text);" >> "${CSS_OUT_PATH}"
        echo "    outline-color: var(--color-${base}-outline);" >> "${CSS_OUT_PATH}"
        echo "    border-color: var(--color-${base}-outline);" >> "${CSS_OUT_PATH}"
        echo "}" >> "${CSS_OUT_PATH}"

        # Links
        echo "" >> "${CSS_OUT_PATH}"
        echo "${prefix} a {" >> "${CSS_OUT_PATH}"
        echo "    color: var(--color-${base}-link);" >> "${CSS_OUT_PATH}"
        echo "    fill: var(--color-${base}-link);" >> "${CSS_OUT_PATH}"
        echo "    stroke: var(--color-${base}-link);" >> "${CSS_OUT_PATH}"
        echo "}" >> "${CSS_OUT_PATH}"

        # Accent
        echo "" >> "${CSS_OUT_PATH}"
        echo "${prefix} .theme-accent {" >> "${CSS_OUT_PATH}"
        echo "    background-color: var(--color-${base}-accent-bg);" >> "${CSS_OUT_PATH}"
        echo "    color: var(--color-${base}-accent-text);" >> "${CSS_OUT_PATH}"
        echo "    fill: var(--color-${base}-accent-text);" >> "${CSS_OUT_PATH}"
        echo "    stroke: var(--color-${base}-accent-text);" >> "${CSS_OUT_PATH}"
        echo "    outline-color: var(--color-${base}-accent-outline);" >> "${CSS_OUT_PATH}"
        echo "    border-color: var(--color-${base}-accent-outline);" >> "${CSS_OUT_PATH}"
        echo "}" >> "${CSS_OUT_PATH}"

        # Accent Link
        echo "" >> "${CSS_OUT_PATH}"
        echo "${prefix} .theme-accent a {" >> "${CSS_OUT_PATH}"
        echo "    color: var(--color-${base}-accent-link);" >> "${CSS_OUT_PATH}"
        echo "    fill: var(--color-${base}-accent-link);" >> "${CSS_OUT_PATH}"
        echo "    stroke: var(--color-${base}-accent-link);" >> "${CSS_OUT_PATH}"
        echo "}" >> "${CSS_OUT_PATH}"

        # Error
        echo "" >> "${CSS_OUT_PATH}"
        echo "${prefix} .theme-error {" >> "${CSS_OUT_PATH}"
        echo "    color: var(--color-${base}-error-text);" >> "${CSS_OUT_PATH}"
        echo "    fill: var(--color-${base}-error-text);" >> "${CSS_OUT_PATH}"
        echo "    stroke: var(--color-${base}-error-text);" >> "${CSS_OUT_PATH}"
        echo "}" >> "${CSS_OUT_PATH}"

        # Drop Shadow
        # This is special because box-shadow does not allow its color to be defined separately (and defaults to `color`).
        echo "" >> "${CSS_OUT_PATH}"
        echo "${prefix} .drop-shadow {" >> "${CSS_OUT_PATH}"
        echo "    box-shadow: 2px 2px 0px var(--color-${base}-outline);" >> "${CSS_OUT_PATH}"
        echo "}" >> "${CSS_OUT_PATH}"
    done

    return 0
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"

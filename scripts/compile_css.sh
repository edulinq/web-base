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
    '.theme-primary .theme-secondary .theme-primary .theme-secondary .theme-primary'
    '.theme-primary .theme-secondary .theme-primary .theme-secondary .theme-primary .theme-secondary'
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
        local active=$(echo "${prefix}" | sed 's/.*-\(\w\+\)$/\1/')

        local inactive='secondary'
        if [[ $active == 'secondary' ]] ; then
            inactive='primary'
        fi

        echo "" >> "${CSS_OUT_PATH}"
        echo "${prefix} {" >> "${CSS_OUT_PATH}"
        echo "    --color-active-bg: var(--color-${active}-bg);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-text: var(--color-${active}-text);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-link: var(--color-${active}-link);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-outline: var(--color-${active}-outline);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-code-bg: var(--color-${active}-code-bg);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-code-text: var(--color-${active}-code-text);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-code-outline: var(--color-${active}-code-outline);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-accent-bg: var(--color-${active}-accent-bg);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-accent-text: var(--color-${active}-accent-text);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-accent-link: var(--color-${active}-accent-link);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-accent-outline: var(--color-${active}-accent-outline);" >> "${CSS_OUT_PATH}"
        echo "    --color-active-error-text: var(--color-${active}-error-text);" >> "${CSS_OUT_PATH}"
        echo "" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-bg: var(--color-${inactive}-bg);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-text: var(--color-${inactive}-text);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-link: var(--color-${inactive}-link);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-outline: var(--color-${inactive}-outline);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-code-bg: var(--color-${inactive}-code-bg);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-code-text: var(--color-${inactive}-code-text);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-code-outline: var(--color-${inactive}-code-outline);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-accent-bg: var(--color-${inactive}-accent-bg);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-accent-text: var(--color-${inactive}-accent-text);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-accent-link: var(--color-${inactive}-accent-link);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-accent-outline: var(--color-${inactive}-accent-outline);" >> "${CSS_OUT_PATH}"
        echo "    --color-inactive-error-text: var(--color-${inactive}-error-text);" >> "${CSS_OUT_PATH}"
        echo "}" >> "${CSS_OUT_PATH}"
    done

    return 0
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"

#!/bin/bash

# Build project.

readonly URL='https://github.com/edulinq/web-base'

readonly THIS_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd | xargs realpath)"
readonly ROOT_DIR="${THIS_DIR}/.."

readonly SAMPLE_DIR="${ROOT_DIR}/sample"
readonly SOURCE_DIR="${ROOT_DIR}/src"

readonly BUILD_DIR="${ROOT_DIR}/build"

readonly DIST_BASE_DIR="${ROOT_DIR}/dist"
readonly SAMPLE_DIST_BASE_DIR="${DIST_BASE_DIR}/sample"

readonly ESBUILD_BIN="${ROOT_DIR}/node_modules/.bin/esbuild"

readonly JS_INDEX_PATH="${SOURCE_DIR}/js/index.ts"
readonly JS_TEMP_OUT_PATH="${BUILD_DIR}/js/edq.temp.js"
readonly JS_BASE_OUT_PATH="${BUILD_DIR}/js/edq.js"

readonly IMAGES_DIR="${SOURCE_DIR}/images"

readonly CSS_OUT_PATH="${BUILD_DIR}/css/edq.css"
readonly CSS_PATHS=(
    "${SOURCE_DIR}/css/constants.css"
    "${SOURCE_DIR}/css/vendor/normalize.css"
    "${SOURCE_DIR}/css/brightness.css"
    "${SOURCE_DIR}/css/icons.css"
    "${SOURCE_DIR}/css/style.css"
)

function main() {
    local prod=false

    if [[ $# -ne 0 ]]; then
        if [[ $# -gt 1 ]] || [[ $1 != '--prod' ]]; then
            echo "USAGE: $0 [--prod]"
            exit 1
        fi

        prod=true
    fi

    local outJSPath="${JS_BASE_OUT_PATH}"
    local distDir="${DIST_BASE_DIR}/dev"
    local sampleDistDir="${SAMPLE_DIST_BASE_DIR}/dev"

    local prodArgs=''
    if [[ "${prod}" = true ]]; then
        prodArgs='--minify'
        outJSPath=$(echo "${outJSPath}" | sed 's/.js$/.min.js/')
        distDir="${DIST_BASE_DIR}/prod"
        sampleDistDir="${SAMPLE_DIST_BASE_DIR}/prod"
    fi

    set -e
    trap exit SIGINT

    cd "${ROOT_DIR}"

    # Cleanup before build.
    rm -rf "${BUILD_DIR}" && mkdir -p "${BUILD_DIR}"
    rm -rf "${distDir}" && mkdir -p "${distDir}"
    rm -rf "${sampleDistDir}" && mkdir -p "${sampleDistDir}"

    # Fetch version.
    local version=$(grep 'const VERSION' "${JS_INDEX_PATH}" | sed "s/^const VERSION = '\(.*\)';$/\1/")
    local versionMessage="EduLinq Web Base v${version}. ${URL}"

    # Bundle JS.
    mkdir -p $(dirname "${outJSPath}")
    "${ESBUILD_BIN}" "${JS_INDEX_PATH}" --bundle --outfile="${JS_TEMP_OUT_PATH}" --sourcemap --platform=neutral --target=chrome58,firefox57,safari11,edge16 ${prodArgs}
    echo -e "/* ${versionMessage} */\n" | cat - "${JS_TEMP_OUT_PATH}" > "${outJSPath}"
    rm "${JS_TEMP_OUT_PATH}"

    # Concat CSS into a single file.
    mkdir -p $(dirname "${CSS_OUT_PATH}")
    echo -e "/* ${versionMessage} */\n" | cat - "${CSS_PATHS[@]}" > "${CSS_OUT_PATH}"

    # Copy images.
    cp -r "${IMAGES_DIR}" "${BUILD_DIR}/"

    # Copy build output to the distribution dir.
    cp -r "${BUILD_DIR}"/* "${distDir}/"

    # Build the sample.
    cp -r "${distDir}" "${sampleDistDir}/edq"
    cp -r "${SAMPLE_DIR}"/* "${sampleDistDir}/"

    return 0
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"

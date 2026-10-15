#!/bin/bash

# Build project.

readonly URL='https://github.com/edulinq/web-base'

readonly THIS_DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd | xargs realpath)"
readonly ROOT_DIR="${THIS_DIR}/.."

readonly LICENSE_PATH="${ROOT_DIR}/LICENSE"
readonly SAMPLE_DIR="${ROOT_DIR}/sample"
readonly SOURCE_DIR="${ROOT_DIR}/src"

readonly BUILD_DIR="${ROOT_DIR}/build"

readonly DIST_BASE_DIR="${ROOT_DIR}/dist"
readonly SAMPLE_DIST_BASE_DIR="${DIST_BASE_DIR}/sample"

readonly ESBUILD_BIN="${ROOT_DIR}/node_modules/.bin/esbuild"

readonly JS_INDEX_PATH="${SOURCE_DIR}/js/index.ts"
readonly JS_TEMP_OUT_PATH="${BUILD_DIR}/js/edq.temp.mjs"
readonly JS_BASE_OUT_PATH="${BUILD_DIR}/js/edq.mjs"

readonly IMAGES_DIR="${SOURCE_DIR}/images"

readonly CSS_OUT_PATH="${BUILD_DIR}/css/edq.css"
readonly CSS_PATHS=(
    "${SOURCE_DIR}/css/constants.css"
    "${SOURCE_DIR}/vendor/normalize.css"
    "${SOURCE_DIR}/vendor/prismjs/prism-dark.css"
    "${SOURCE_DIR}/vendor/prismjs/prism-light.css"
    "${SOURCE_DIR}/css/brightness.css"
    "${SOURCE_DIR}/css/icons.css"
    "${SOURCE_DIR}/css/util.css"
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

    # Fetch version.
    local version=$(grep 'const VERSION' "${JS_INDEX_PATH}" | sed "s/^const VERSION = '\(.*\)';$/\1/")
    local versionMessage="EduLinq Web Base v${version}. ${URL}"

    local prodArgs=''
    local outJSPath="${JS_BASE_OUT_PATH}"
    local distDirname="dev"
    local zipDirname="edq-${version}"

    if [[ "${prod}" = true ]]; then
        prodArgs='--minify'
        outJSPath=$(echo "${outJSPath}" | sed 's/.mjs$/.min.mjs/')
        distDirname="prod"
        zipDirname="${zipDirname}-min"
    fi

    local distDir="${DIST_BASE_DIR}/${distDirname}"
    local sampleDistDir="${SAMPLE_DIST_BASE_DIR}/${distDirname}"

    set -e
    trap exit SIGINT

    cd "${ROOT_DIR}"

    # Cleanup before build.
    rm -rf "${BUILD_DIR}" && mkdir -p "${BUILD_DIR}"
    rm -rf "${distDir}" && mkdir -p "${distDir}"
    rm -rf "${sampleDistDir}" && mkdir -p "${sampleDistDir}"

    # Bundle JS.
    mkdir -p $(dirname "${outJSPath}")
    "${ESBUILD_BIN}" "${JS_INDEX_PATH}" --bundle --outfile="${outJSPath}" --sourcemap --platform=neutral --target=chrome60,edge79,firefox55,safari15 ${prodArgs}
    echo -e "/* ${versionMessage} */\n" | cat - "${outJSPath}" > "${JS_TEMP_OUT_PATH}"
    mv "${JS_TEMP_OUT_PATH}" "${outJSPath}"

    # Concat CSS into a single file.
    mkdir -p $(dirname "${CSS_OUT_PATH}")
    echo -e "/* ${versionMessage} */\n" | cat - "${CSS_PATHS[@]}" > "${CSS_OUT_PATH}"

    # Copy license and version.
    cp "${LICENSE_PATH}" "${BUILD_DIR}/"
    echo "${version}" > "${BUILD_DIR}/version.txt"

    # Copy images.
    cp -r "${IMAGES_DIR}" "${BUILD_DIR}/"

    # Copy build output to the distribution dir.
    cp -r "${BUILD_DIR}"/* "${distDir}/"

    # Make a zip of the output.
    (
        cd "${DIST_BASE_DIR}" \
        && rm -f "${zipDirname}" "${zipDirname}.zip" \
        && cp -r "${distDirname}" "${zipDirname}" \
        && zip -r "${zipDirname}.zip" "${zipDirname}" \
        && rm -r "${zipDirname}"
    )

    # Build the sample.
    cp -r "${distDir}" "${sampleDistDir}/edq"
    cp -r "${SAMPLE_DIR}"/* "${sampleDistDir}/"

    return 0
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"

set -e

if [[ "$1" == "--compile" ]]; then
    COMPILE="true"
    shift
fi
THEME_FILTER=${1:-[a-z]}
COLOR_FILTER=${2:-[a-f0-9]-[a-f0-9]}
mkdir -p .scss

sassFiles=""

for theme in ${THEME_FILTER}*/[a-z]*.scss; do 
    themeFile=`basename $theme`
    for color in _colors/_color-*${COLOR_FILTER}*.scss; do
        colorFile=`basename $color`

        scssFile=".scss/${themeFile/.scss/}-${colorFile/_color-/}"
        k=${colorFile/.scss/}
        color=${k/_color-/}
        cssFile="../git/formuladb-env/css/${themeFile/.scss/}-${color}.css"

        cat $theme | sed -e "s!_color-TBDTBD-TBDTBD.scss!${colorFile}!" > $scssFile

        echo "${scssFile} ${cssFile}"
        if [[ -n "$COMPILE" ]]; then 
            node-sass ${scssFile} ${cssFile} &
        fi
    done
    wait
done

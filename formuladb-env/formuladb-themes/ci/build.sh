set -ex

DEVMODE=$1
mkdir -p _scss _css

sassFiles=""
echo > _css/frmdb-theme-list.txt
echo > _scss/frmdb-theme-preview.scss

for theme in [a-z]*/[a-z]*.scss; do 
    themeFile=`basename $theme`
    for color in _colors/_color-*.scss; do
        colorFile=`basename $color`

        scssFile="_scss/${themeFile/.scss/}-${colorFile/_color-/}"
        cssFile="_css/${themeFile/.scss/}-${colorFile/_color-/}.min.css"

        cat $theme | sed -e "s!_color-TBDTBD-TBDTBD.scss!${colorFile}!" > $scssFile
        echo $cssFile >> _css/frmdb-theme-list.txt

        echo '
            .frmdb-theme-preview-'${themeFile/.scss/}'-'${colorFile/_color-/}' {
                @import "../node_modules/bootswatch/dist/'${themeFile/.scss/}'/variables";
                @import "../_colors/'${colorFile}'";
            
                @import "../node_modules/bootstrap/scss/functions";
                @import "../node_modules/bootstrap/scss/variables";
                @import "../node_modules/bootstrap/scss/mixins";
                @import "../node_modules/bootstrap/scss/buttons";
                @import "../node_modules/bootstrap/scss/navbar";
            
                @import "../node_modules/bootswatch/dist/'${themeFile/.scss/}'/bootswatch";   
            }        
        ' >> _scss/frmdb-theme-preview.scss

        # sassFiles="${sassFiles} ${scssFile}:${cssFile}"
        # sassFiles="${sassFiles} ${frmdbColorsScssFile}:${frmdbColorsCssFile}"
    done
done
# sassFiles="${sassFiles} _scss/frmdb-theme-preview.scss:_css/frmdb-theme-preview.min.css"

# echo $sassFiles
# time sass $sassFiles

# egrep -o '#[a-fA-F0-9]{3,6}|rgba\([0-9]{1,3}, ?[0-9]{1,3}, ?[0-9]{1,3}, ?[.0-9]{1,3}\)' _css/lux-593196-a991d4.scss.min.css |sort|uniq > c1
# egrep -o '#[a-fA-F0-9]{3,6}|rgba\([0-9]{1,3}, ?[0-9]{1,3}, ?[0-9]{1,3}, ?[.0-9]{1,3}\)' _css/frmdb-colors-593196-a991d4.scss.min.css|sort|uniq > c2
# sdiff c1 c2 | less

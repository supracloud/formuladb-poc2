trap err ERR
function err() {
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND"
    cd "${ORIGDIR}"
}

THEME_NAME=$1
if [[ -z "$THEME_NAME" ]]; then echo "Usage: add-bootswatch-theme.sh theme-name"; exit 1; fi

mkdir -p "${THEME_NAME}"
echo "
.frmdb-theme-${THEME_NAME} {
    @import '../../node_modules/bootswatch/dist/${THEME_NAME}/variables';
    @import '../node_modules/bootstrap/scss/bootstrap.scss';
    @import '../../node_modules/bootswatch/dist/${THEME_NAME}/bootswatch';

    @import '../frmdb/frmdb';
}
" > "${THEME_NAME}/${THEME_NAME}.scss"

cp ../../bootswatch/docs/${THEME_NAME}/thumbnail.png ${THEME_NAME}/${THEME_NAME}.png

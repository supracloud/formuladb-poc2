set -ex

#manual rename to $AUTOID


mkdir -p frmdb-apps/restaurant/static

for app in \
frmdb-apps/pizza-time \
frmdb-apps/luxurious-restaurant \
frmdb-apps/restaurat-good-food \
frmdb-apps/raw-baking \
frmdb-apps/vivaldi-restaurant \
frmdb-apps/baking-bread \
frmdb-apps/local-restaurant \
frmdb-apps/proper-stack-house\
; do
    if [ -f "$app/index.html" ]; then
        git mv $app/index.html frmdb-apps/restaurant/`basename $app`.html
    fi
    for i in $app/static/*; do 
        if [ -f "$i"]; then 
            git mv $i frmdb-apps/restaurant/static/`basename $app`_`basename $i`; 
            perl -p -i -e "s!\b$app/static/$i\b!restaurant/static/`basename $app`_`basename $i`!g" frmdb-apps/restaurant/`basename $app`.html
        fi
    done
    rm -rf $app/
done

#manual fix local-restaurant/vegetarian-restaurant 

perl -p -i -e "s/\bSTRING\b/TEXT/g" db/*.yaml

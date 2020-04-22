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
        if [ -f "$i" ]; then 
            git mv $i frmdb-apps/restaurant/static/`basename $app`_`basename $i`; 
        fi
    done
    rm -rf $app/
done

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
    appName=`basename $app`
    perl -p -i -e 's!\b'$appName'/static/(.*\.jpg)\b!restaurant/static/'$appName'_$1!g' frmdb-apps/restaurant/$appName.html
done
#manual fix local-restaurant/vegetarian-restaurant 

perl -p -i -e "s/\bSTRING\b/TEXT/g" db/*.yaml


mkdir -p frmdb-apps/hotel/static
if [ -d hote-booking ]; then
    cp -f frmdb-apps/hotel-booking/*html frmdb-apps/hotel/
    cp -f frmdb-apps/hotel-booking/*yaml frmdb-apps/hotel/
    rm frmdb-apps/hotel/index.html
fi

for app in \
frmdb-apps/click-hostel \
frmdb-apps/hotel-booking \
frmdb-apps/summer-villa \
; do
    if [ -f "$app/index.html" ]; then
        git mv $app/index.html frmdb-apps/hotel/`basename $app`.html
    fi
    for i in $app/static/*; do 
        if [ -f "$i" ]; then 
            git mv $i frmdb-apps/hotel/static/`basename $app`_`basename $i`; 
        fi
    done
    rm -rf $app/
done

for app in \
frmdb-apps/click-hostel \
frmdb-apps/hotel-booking \
frmdb-apps/summer-villa \
; do
    appName=`basename $app`
    perl -p -i -e 's!\b'$appName'/static/(.*\.jpg)\b!hotel/static/'$appName'_$1!g' frmdb-apps/hotel/$appName.html
done

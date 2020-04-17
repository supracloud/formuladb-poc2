# rename to $AUTOID
cd frmdb-apps
git mv pizza-time restaurant

for app in luxurious-restaurant restaurat-good-food raw-baking vivaldi-restaurant baking-bread local-restaurant proper-stack-house; do
    git mv $app/index.html restaurat/$app.html
    for i in $app/static/*; do git mv $i restaurat/static/; done
    rm -rf $app/
done

cd restaurant
for app in pizza-time luxurious-restaurant restaurat-good-food raw-baking vivaldi-restaurant baking-bread local-restaurant proper-stack-house; do
    perl -p -i -e "s/\b$app\b/restaurant/g" *.html
done

cd ../../
perl -p -i -e "s/\bSTRING\b/TEXT/g" db/*.yaml

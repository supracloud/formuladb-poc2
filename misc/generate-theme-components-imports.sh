for i in CardComponent FormEnumComponent ListComponent GalleryComponent CalendarComponent ImageComponent IconComponent MediaComponent VNavComponent HNavComponent TimelineComponent DropdownComponent VFiltersComponent HFiltersComponent ButtonComponent ButtonGroupComponent; do
    k=`echo $i|sed -e 's/Component//' | sed 's/\([a-z0-9]\)\([A-Z]\)/\1_\L\2/g' | tr '[:upper:]' '[:lower:]'`
    echo "import { ${i} as Base${i} } from \"@fe/app/form/${k}/${k}.component\";"
done

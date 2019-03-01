for i in Button ButtonGroup Calendar Card Dropdown FormDataGrid FormEnum FormItem FormState Gallery HFilters HLayout HNav Icon Image List Media Timeline VFilters VLayout VNavComp; do
    k=`echo $i|sed -e 's/Component//' | sed 's/\([a-z0-9]\)\([A-Z]\)/\1_\L\2/g' | tr '[:upper:]' '[:lower:]'`
    echo "
export class ${i} implements SubObj {
    readonly nodeType = NodeType.${k};
    _id: string;
}
"
done

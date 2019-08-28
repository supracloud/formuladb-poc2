#!/bin/bash
set -e

if [ $# -ne 4 ]
  then
    echo "Expecting 4 arguments: token, project id, repository id and max age in days"
    exit 1
fi

token=$1
project_id=$2
repository_id=$3
max_age=$(( 86400*$4 ))

tags=`curl --header "PRIVATE-TOKEN: $token" "https://gitlab.com/api/v4/projects/$project_id/registry/repositories/$repository_id/tags?per_page=100"|jq ".[] | .name"`
devel_version_regex="-[0-9]+-[0-9a-z]{8}"
for tag in $tags
do
    stripped_tag=`sed 's/"//g' <(echo -n $tag)`
    if [[ $stripped_tag =~ $devel_version_regex ]]
    then
        created_at=`curl --header "PRIVATE-TOKEN: $token" "https://gitlab.com/api/v4/projects/$project_id/registry/repositories/$repository_id/tags/$stripped_tag"|jq ".created_at"`
        stripped_created_at=`sed 's/"//g' <(echo -n $created_at)`
        age=`date -d @$(( $(date +%s) - $(date -d $stripped_created_at +%s) )) -u +'%s'`
        if [[ $age -gt $max_age ]]
        then
            curl --request DELETE --header "PRIVATE-TOKEN: $token" "https://gitlab.com/api/v4/projects/$project_id/registry/repositories/$repository_id/tags/$stripped_tag"
        fi
    fi
done

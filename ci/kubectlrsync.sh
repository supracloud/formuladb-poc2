#!/bin/bash

if [ -z "$KRSYNC_STARTED" ]; then
    export KRSYNC_STARTED=true

    rsyncArgs=""
    while [[ $1 == -* ]]; do
        rsyncArgs="${rsyncArgs} $1"
        shift
    done
    src=$1
    shift
    dst=$1
    shift
    namespace="`git branch|grep '^*'|cut -d ' ' -f2`"
    if echo "$src" | grep '.*:'; then
        service_name=`echo "$src" | sed -e 's/:.*//'`
        path=`echo "$src" | sed -e 's/.*://'`
        pod=`kubectl -n ${namespace} get pod -l service=${service_name} -o jsonpath='{.items[0].metadata.name}'`
        src="${pod}@${namespace}:${path}"
    else 
        service_name=`echo "$dst" | sed -e 's/:.*//'`
        path=`echo "$dst" | sed -e 's/.*://'`
        pod=`kubectl -n ${namespace} get pod -l service=${service_name} -o jsonpath='{.items[0].metadata.name}'`
        dst="${pod}@${namespace}:${path}"
    fi

    exec rsync --blocking-io --rsh "$0" $rsyncArgs $src $dst
fi

# Running as --rsh
namespace=''
pod=$1
shift

# If use uses pod@namespace rsync passes as: {us} -l pod namespace ...
if [ "X$pod" = "X-l" ]; then
    pod=$1
    shift
    namespace="-n $1"
    shift
fi

exec kubectl $namespace exec -i $pod -- "$@"

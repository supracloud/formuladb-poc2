set -ex

trap _cleanup ERR
trap _cleanup EXIT

echo '<testsuites><testsuite name="API tests">' > api-tests.junit.xml
function _cleanup {
    echo '</testsuite></testsuites>' >> api-tests.junit.xml
}

for i in ci/api-tests/*; do
    echo -n '<testcase classname="API" name="'$i'" ' >> api-tests.junit.xml
    if bash $i; then 
        echo ' />' >> api-tests.junit.xml
    else
        echo '><failure message="err"></failure></testcase>' >> api-tests.junit.xml
    fi
done

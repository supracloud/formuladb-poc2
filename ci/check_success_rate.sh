set -ex

successRate=$1
shift

nbTests=`grep -o '<testcase ' "$@" | wc -l`
nbErrors=`grep -o '<testcase .*<failure' "$@" | wc -l`
okPercent=$(( ($nbTests - $nbErrors) * 100 / $nbTests))
echo "$nbErrors errors out of $nbTests tests, success rate ${okPercent}%"
(($okPercent >= $successRate))

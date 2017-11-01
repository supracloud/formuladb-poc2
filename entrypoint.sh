tc qdisc change dev eth0 root netem delay 150ms
# /wondershaper.sh -a eth0 -d 256 -u 256

/docker-entrypoint.sh.orig "$@"

USER=$1
PASS=$2
htpasswd -nb "${USER}" "${PASS}" >> auth.htpasswd

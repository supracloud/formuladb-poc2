set -ex

# curl -s -XPOST -H "Content-Type: application/x-www-form-urlencoded" http://frmdb.localhost/en/users/register \
curl -s -XPOST -d 'email=test1@email&password=abc345!&envname=test1' http://frmdb.localhost/en/users/register \

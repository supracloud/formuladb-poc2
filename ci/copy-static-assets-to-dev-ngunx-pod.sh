echo "Change detected on static assets, copying to nginx pod..."
NAMESPACE=`git branch|grep '^*'|cut -d ' ' -f2`
while ! kubectl -n $NAMESPACE get pods | grep 'nginx-.*Running'; do sleep 1; done
POD=`kubectl -n $NAMESPACE get pod -l service=nginx -o jsonpath='{.items[0].metadata.name}'`
kubectl -n "$NAMESPACE" cp formuladb-static $POD:/usr/share/nginx/html/
kubectl -n "$NAMESPACE" cp formuladb-themes $POD:/usr/share/nginx/html/

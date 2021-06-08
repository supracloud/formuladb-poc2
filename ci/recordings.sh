export KUBECONFIG=k8s/production-kube-config.conf

cat <<EOF | kubectl -n staging apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recordings-from-localdev
  labels:
    app: recordings-from-localdev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: recordings-from-localdev
  template:
    metadata:
      labels:
        app: recordings-from-localdev
    spec:
      containers:
      - name: recordings-from-localdev
        image: registry.formuladb.io/formuladb/febe/ci:0.0.7
        ports:
        - containerPort: 80
      imagePullSecrets:
      - name: regcred        
EOF

kubectl -n staging cp ../formuladb-e2e 
kubectl -n staging exec deploment/ -- bash -c 'source /bootstrap && TARGET=recordings-with-audio npm test -- --specs "tsc-out/docs/4-addon-apps/*.e2e.js" --baseUrl="http://127.0.0.1:3000"'
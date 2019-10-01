# Download kustomize
FROM alpine:3.10 as download-kustomize
ENV KUSTOMIZE_VERSION v3.2.1
ENV KUSTOMIZE_URL https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2F${KUSTOMIZE_VERSION}/kustomize_kustomize.${KUSTOMIZE_VERSION}_linux_amd64
RUN wget -O kustomize "${KUSTOMIZE_URL}"
RUN chmod +x kustomize

# Download kubectl
FROM alpine:3.10 as download-kubectl
ENV KUBECTL_VERSION v1.15.4
ENV KUBECTL_URL https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl
RUN wget -O kubectl "${KUBECTL_URL}"
RUN chmod +x kubectl

# Download skaffold
FROM alpine:3.10 as download-skaffold
ENV SKAFFOLD_VERSION v0.39.0
ENV SKAFFOLD_URL https://storage.googleapis.com/skaffold/releases/${SKAFFOLD_VERSION}/skaffold-linux-amd64
RUN wget -O skaffold "${SKAFFOLD_URL}"
RUN chmod +x skaffold


FROM node:lts-alpine
COPY --from=download-kustomize kustomize /usr/local/bin/
COPY --from=download-kubectl kubectl /usr/local/bin/
COPY --from=download-skaffold skaffold /usr/local/bin/

ARG BUILD_DEVELOPMENT
ENV NPM_SCRIPT=${BUILD_DEVELOPMENT:+start_dev}
ENV NPM_SCRIPT=${NPM_SCRIPT:-start}

RUN apk update --no-cache && apk upgrade --no-cache && \
    apk add --no-cache bash git python2 perl py-pip

# https://stackoverflow.com/questions/44442354/using-standalone-gsutil-from-within-gke
RUN pip install google-compute-engine

RUN wget https://storage.googleapis.com/pub/gsutil.tar.gz && \
    mkdir /gsutil && \
    tar xfz gsutil.tar.gz && \
    rm gsutil.tar.gz

RUN echo $'[GSUtil]\n\
default_project_id = seismic-plexus-232506\n\
default_api_version = 2\n\
[GoogleCompute]\n\
service_account = default\n\
[Plugin]\n\
plugin_directory = /usr/lib/python2.7/site-packages/google_compute_engine/boto' >> /root/.boto

ENV PATH="${PATH}:/gsutil"
ENV KUBECONFIG=k8s/production-kube-config.conf

COPY package.json /package.json

RUN npm install --only=production

COPY k8s /k8s/
COPY skaffold.yaml /skaffold.yaml

COPY dist-be/frmdb-be* /dist-be/

EXPOSE 3000

CMD npm run $NPM_SCRIPT

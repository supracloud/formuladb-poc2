# Download kustomize
FROM alpine:3.10 as download-kustomize
ENV KUSTOMIZE_VERSION 2.1.0
ENV KUSTOMIZE_URL https://github.com/kubernetes-sigs/kustomize/releases/download/v${KUSTOMIZE_VERSION}/kustomize_${KUSTOMIZE_VERSION}_linux_amd64
RUN wget -O kustomize "${KUSTOMIZE_URL}"
RUN chmod +x kustomize

# Download kubectl
FROM alpine:3.10 as download-kubectl
ENV KUBECTL_VERSION v1.12.8
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
    apk add --no-cache bash git python2 perl

RUN wget https://storage.googleapis.com/pub/gsutil.tar.gz && \
    mkdir /gsutil && \
    tar xfz gsutil.tar.gz && \
    rm gsutil.tar.gz

ENV PATH="${PATH}:/gsutil"

COPY package.json /package.json

RUN npm install --only=production

COPY k8s /k8s/

COPY dist-be/frmdb-be* /dist-be/

EXPOSE 3000

CMD npm run $NPM_SCRIPT

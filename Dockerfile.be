# Download kustomize
FROM alpine:3.10 as download-kustomize
ENV KUSTOMIZE_VERSION v3.6.1
ENV KUSTOMIZE_URL https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2F${KUSTOMIZE_VERSION}/kustomize_${KUSTOMIZE_VERSION}_linux_amd64.tar.gz
RUN wget -O kustomize.tgz "${KUSTOMIZE_URL}"
RUN tar -xzvf kustomize.tgz
RUN chmod +x kustomize
RUN rm kustomize.tgz

# Download kubectl
FROM alpine:3.10 as download-kubectl
ENV KUBECTL_VERSION v1.16.1
ENV KUBECTL_URL https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl
RUN wget -O kubectl "${KUBECTL_URL}"
RUN chmod +x kubectl

# Download skaffold
FROM alpine:3.10 as download-skaffold
ENV SKAFFOLD_VERSION v1.10.0
ENV SKAFFOLD_URL https://storage.googleapis.com/skaffold/releases/${SKAFFOLD_VERSION}/skaffold-linux-amd64
RUN wget -O skaffold "${SKAFFOLD_URL}"
RUN chmod +x skaffold


FROM node:lts-alpine
COPY --from=download-kustomize kustomize /usr/local/bin/
COPY --from=download-kubectl kubectl /usr/local/bin/
COPY --from=download-skaffold skaffold /usr/local/bin/

ARG BUILD_DEVELOPMENT
# ENV NPM_SCRIPT=${BUILD_DEVELOPMENT:+start_dev}
ENV NPM_SCRIPT=${NPM_SCRIPT:-start}

ENV GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i /ssh/frmdb.id_rsa"

RUN apk update --no-cache && apk upgrade --no-cache && \
    apk add --no-cache less bash git git-lfs perl postgresql-client \
    vim openssh vimdiff curl rsync findutils \
    udev ttf-freefont chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser

ENV KUBECONFIG=k8s/production-kube-config.conf

COPY package.json /package.json

RUN npm install --only=production

COPY k8s /k8s/
COPY skaffold.yaml /skaffold.yaml
ADD ./ssh /ssh
RUN chmod 700 /ssh
RUN chmod 644 /ssh/frmdb.id_rsa.pub
RUN chmod 600 /ssh/frmdb.id_rsa
ADD ./scripts /scripts

RUN echo "db:5432:postgres:postgres:postgres" > /root/.pgpass
RUN chmod 0600 /root/.pgpass

ADD ./formuladb /wwwroot/formuladb
COPY dist-be/frmdb-be* /dist-be/

EXPOSE 3000

CMD ls -ltra /wwwroot/git/formuladb-env; npm run $NPM_SCRIPT

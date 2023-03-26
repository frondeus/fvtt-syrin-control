FROM alpine:latest
ARG version=v10

RUN apk add nodejs

ENV UID=1000
RUN adduser -u $UID -D foundry

USER foundry

RUN mkdir -p /home/foundry/data && \
    mkdir -p /home/foundry/app

WORKDIR /home/foundry/data
COPY --chown=$UID /foundrydata/ .

WORKDIR /home/foundry/app
COPY "/foundryvtt-${version}/" .
COPY "run-foundry.sh" .

EXPOSE 3000:30000
ENTRYPOINT ["/bin/sh", "/home/foundry/app/run-foundry.sh"]

FROM ghcr.io/cerbos/cerbos:latest

WORKDIR /app

COPY ./config.yml /config.yml

COPY ./policies /policies

EXPOSE 3592

CMD ["server", "--config=/config.yml"]
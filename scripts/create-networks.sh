#!/bin/bash

NETWORKS=("financial-db-net" "financial-mq-net" "financial-obs-net")
ENV=${1:-dev}

for NET in "${NETWORKS[@]}"; do
  NET_NAME="$NET-$ENV"
  if ! docker network inspect "$NET_NAME" >/dev/null 2>&1; then
    docker network create "$NET_NAME"
    echo "Rede '$NET_NAME' criada com sucesso."
  else
    echo "Rede '$NET_NAME' já existe. Pulando."
  fi
done
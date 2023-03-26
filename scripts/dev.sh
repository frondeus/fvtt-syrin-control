#!/usr/bin/env bash

pushd ./docs/foundry

docker compose up -d foundry --remove-orphans

popd

npm run dev "$@"

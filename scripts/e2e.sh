#!/usr/bin/env bash

pushd docs/foundry

docker-compose up -d --remove-orphans

popd

tmux new-session -s "syrincontrol" \; \
  send-keys "yarn dev --no-open" C-m \; \
  split-window -v \; \
  send-keys "yarn run cypress open --e2e -b chrome" C-m \; \
  select-layout tiled;

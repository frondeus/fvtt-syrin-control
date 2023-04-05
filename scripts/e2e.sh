#!/usr/bin/env bash

pushd docs/foundry

docker compose up -d --remove-orphans

popd

tmux new-session -s "syrincontrol" \; \
  send-keys "npm run dev --no-open" C-m \; \
  split-window -v \; \
  send-keys "npx cypress open --e2e -b firefox" C-m \; \
  select-layout tiled;

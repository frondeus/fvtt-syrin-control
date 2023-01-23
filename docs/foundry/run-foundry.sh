#!/bin/bash

# chown -R foundry:foundry /home/foundry/data

ln -s /home/foundry/fvtt-syrin-control /home/foundry/data/Data/modules/fvtt-syrin-control
node /home/foundry/app/resources/app/main.js --headless --dataPath=/home/foundry/data "$@"

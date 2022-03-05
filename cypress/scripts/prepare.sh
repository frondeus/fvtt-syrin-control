#!/usr/bin/env bash

FOUNDRYDATA="$1"
WORLDNAME="$2"
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`

cp -R "$SCRIPTPATH/../fixtures/$WORLDNAME" "$FOUNDRYDATA/Data/worlds/test"

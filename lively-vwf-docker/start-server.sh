#! /bin/bash

LV_PORT=${1-9001}
VWF_PORT=${2-3000}

docker run \
    -p $LV_PORT:$LV_PORT \
    -p $VWF_PORT:$VWF_PORT \
    -e "livelyport=$LV_PORT" \
    -e "vwfport=$VWF_PORT" \
    -t -i old-lively-vwf-server

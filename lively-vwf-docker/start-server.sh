#! /bin/bash

LV_PORT=${1-9001}
VWF_PORT=${2-3000}

docker run \
    -p $LV_PORT:$LV_PORT \
    -p $VWF_PORT:$VWF_PORT \
    -P \
    -e "livelyport=$LV_PORT" \
    -e "vwfport=$VWF_PORT" \
    -e "vwfapp=/var/www/vwf/public" \
    -t -i lively-vwf-server

# docker run \
#     -p $LV_PORT:$LV_PORT \
#     -p $VWF_PORT:$VWF_PORT \
#     -p 3008:3008 \
#     -p 8080:8080 \
#     -p 8081:8081 \
#     -p 8082:8082 \
#     -e "livelyport=$LV_PORT" \
#     -e "vwfport=$VWF_PORT" \
#     -t -i lively-vwf-server

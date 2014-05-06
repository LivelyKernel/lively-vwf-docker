#!/bin/bash

bash -c "docker run -p 40922:22 -t -i lively-server /usr/sbin/sshd -D" &

sleep 3

containerid=`docker ps | grep lively-server:latest | awk '{ print $1 }'`

./get-lively-setup-files.sh

docker stop $containerid

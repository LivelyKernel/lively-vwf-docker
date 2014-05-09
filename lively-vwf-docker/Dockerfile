FROM          lively-server
MAINTAINER    Robert Krahn <robert.krahn@gmail.com>

RUN cd /var/www && git clone https://github.com/virtual-world-framework/vwf.git --recursive

ENV LIVELY /var/www/LivelyKernel
ENV VWF /var/www/vwf
WORKDIR /var/www/vwf
#RUN git checkout master
RUN npm install

# make lively load without deserialization
ADD localconfig.js $LIVELY/core/lively/localconfig.js

# apply patch to solve require() name clash
ADD requirejs.patch $LIVELY/requirejs.patch
RUN git apply --directory $LIVELY/ $LIVELY/requirejs.patch

ENV livelyport 9001
ENV vwfport 3000

EXPOSE 8080
EXPOSE 8081
EXPOSE 8082
EXPOSE 8083

CMD cd $LIVELY; forever start bin/lk-server.js -p $livelyport; \
    cd $VWF; node node-server.js -p $vwfport -l 100 -a ./$LIVELY

# sleep 2; \
# tail -f $HOME/.forever/`ls -t ~/.forever | egrep "*.log$" | head -n 1`

# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
# docker build --rm -t lively-vwf-server .
# docker run -p 9001:9001 -p 3000:3000 -t -i lively-vwf-server
# docker build --rm -t lively-vwf-server . && ./start-server.sh 9005 3006

# a checkout of this branch
# git clone -b vwf-compat https://github.com/LivelyKernel/LivelyKernel.git public/lively
# Make sure there is a file localconfig.js similar to the one listed in LivelyKernel/LivelyKernel#206 in public/lively
# You should then be able to startup a world with a single rectangle by visiting http://VWF_HOST:VWF_PORT/lively/.

# note: localconfig.js!

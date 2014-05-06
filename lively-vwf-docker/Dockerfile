FROM          lively-server
MAINTAINER    Robert Krahn <robert.krahn@gmail.com>

RUN cd /var/www && git clone -b branch/morph https://github.com/LivelyKernel/vwf --recursive

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

CMD cd $LIVELY; \
    forever start bin/lk-server.js -p 9001; \
    cd $VWF; \
    node node-server.js -l 100 -a $LIVELY

# -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
# docker build --rm -t lively-vwf-server .
# docker run -p 9001:9001 -p 3000:3000 -t -i lively-vwf-server
# docker build --rm -t old-lively-vwf-server . && docker run -p 9001:9001 -p 3000:3000 -t -i old-lively-vwf-server

# a checkout of this branch
# git clone -b vwf-compat https://github.com/LivelyKernel/LivelyKernel.git public/lively
# Make sure there is a file localconfig.js similar to the one listed in LivelyKernel/LivelyKernel#206 in public/lively
# You should then be able to startup a world with a single rectangle by visiting http://VWF_HOST:VWF_PORT/lively/.

# note: localconfig.js!

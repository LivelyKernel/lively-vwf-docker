# lively + vwf

## Install steps:

1. Build lively-server image:

```sh
$ cd lively-docker;
$ docker build --rm -t lively-server .
```

2. Build vwf-docker:

```sh
$ cd
$ docker build --rm -t lively-vwf-server .
```

3. Start server:

```sh
$ docker run -p 9001:9001 -p 3000:3000 -t -i lively-vwf-server
```

4. Visit http://23.92.25.59:3000/

(A lively server is also running and ready for development on http://23.92.25.59:9001/)

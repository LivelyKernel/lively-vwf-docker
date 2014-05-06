#!/bin/bash

ssh -p 40922 root@127.0.0.1 "cd /var/www/LivelyKernel/ && sqlite3 objects.sqlite .dump > objects.sqlite.exported"
rsync -vzPe "ssh -p 40922" \
    root@127.0.0.1:/var/www/LivelyKernel/objects.sqlite.exported .

# rm -rfd PartsBin/
# rsync -rlptD -vzPe "ssh -p 40922" \
#     root@127.0.0.1:/var/www/LivelyKernel/PartsBin PartsBin

#!/bin/bash

# start my application automatically on reboot
export NODE_ENV=production
cd /home/ec2-user/memlist2
nohup node --inspect memlist2.js &




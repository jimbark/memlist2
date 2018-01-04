#!/bin/bash

# start my application automatically on reboot
export NODE_ENV=production
nohup node --inspect /home/ec2-user/memlist2/memlist2.js &



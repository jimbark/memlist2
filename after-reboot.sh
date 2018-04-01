#!/bin/bash

# start my application automatically on reboot
su ec2-user
export NODE_ENV=production
cd /home/ec2-user/memlist2
node memlist2_cluster.js  > ./log/console.txt 2>&1 &





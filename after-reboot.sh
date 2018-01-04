#!/bin/bash

# start my application automatically on reboot
export NODE_ENV=production
nohup node --inspect memlist2.js &



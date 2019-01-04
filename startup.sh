#!/bin/sh

OUTPUT_PATH="/home/wp2018/user/vincent/EZBuy/out"
node main_server.js > "${OUTPUT_PATH}/main_server.out" &
echo "Main server startup"
cd intro && node serv.js > "${OUTPUT_PATH}/intro_server.out" &
echo "Intro server startup"


#!/bin/bash

OUTPUT_PATH='~/EZBuy/out'
mkdir $OUTPUT_PATH
nohup node main_server.js > "${OUTPUT_PATH}/main_server.out" &
echo "Main server startup"
cd intro && nohup node serv.js > "${OUTPUT_PATH}/intro_server.out" &
echo "Intro server startup"


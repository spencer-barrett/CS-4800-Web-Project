#!/bin/bash

echo "pulling latest code..."
git pull 

echo "Intalling depoendencies..."
npm i

echo "building project..."
npm run build


echo "restarting pm2..."
pm2 restart clubfish-server

echo "deploy completed"
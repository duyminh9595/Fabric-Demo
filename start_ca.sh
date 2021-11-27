#!/bin/bash
docker rm -vf $(docker ps -aq) && docker volume prune -f
docker network prune
source ./terminal_control.sh

cd ./supplychain-network/docker/

print Green "========== Bringing up the CA docker containers =========="
docker-compose -f docker-compose-ca.yaml up -d 
# sleep 3

# cd supplychain-network/fabric-ca-server-script/
# ./create_certs.sh 
# sleep 3
# cd ..
# ./create_artifacts.sh 
# sleep 3
# cd ..
# ./start_network.sh 
# cd supplychain-network/
# ./create_channel.sh 
# ./deploy_chaincodenode.sh 
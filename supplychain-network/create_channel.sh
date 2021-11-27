#!/bin/bash
source ../terminal_control.sh

export FABRIC_CFG_PATH=${PWD}/../config/
export CORE_PEER_TLS_ENABLED=false
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/supplychain.com/orderers/orderer.supplychain.com/msp/tlscacerts/tlsca.supplychain.com-cert.pem

export CHANNEL_NAME=supplychain-channel

setEnvForPeer0DuyMinhOrg() {
    export PEER0_ORG1_CA=${PWD}/organizations/peerOrganizations/DuyMinhOrg.supplychain.com/peers/peer0.DuyMinhOrg.supplychain.com/tls/ca.crt
    export CORE_PEER_LOCALMSPID=DuyMinhOrgMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/DuyMinhOrg.supplychain.com/users/Admin@DuyMinhOrg.supplychain.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setEnvForPeer1DuyMinhOrg() {
    export PEER1_ORG1_CA=${PWD}/organizations/peerOrganizations/DuyMinhOrg.supplychain.com/peers/peer1.DuyMinhOrg.supplychain.com/tls/ca.crt
    export CORE_PEER_LOCALMSPID=DuyMinhOrgMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER1_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/DuyMinhOrg.supplychain.com/users/Admin@DuyMinhOrg.supplychain.com/msp
    export CORE_PEER_ADDRESS=localhost:8051
}



createChannel() {
    setEnvForPeer0DuyMinhOrg

    print Green "========== Creating Channel =========="
    echo ""
    peer channel create -o localhost:7050 -c $CHANNEL_NAME \
    --ordererTLSHostnameOverride orderer.supplychain.com \
    -f ./channel-artifacts/$CHANNEL_NAME.tx --outputBlock \
    ./channel-artifacts/${CHANNEL_NAME}.block \
    --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA 
    echo ""
}

joinChannel() {
    
    setEnvForPeer0DuyMinhOrg
    print Green "========== Peer0DuyMinhOrg Joining Channel '$CHANNEL_NAME' =========="
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    echo ""

    setEnvForPeer1DuyMinhOrg
    print Green "========== Peer1DuyMinhOrg Joining Channel '$CHANNEL_NAME' =========="
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    echo ""



    
}

updateAnchorPeers() {
    setEnvForPeer0DuyMinhOrg
    print Green "========== Updating Anchor Peer of Peer0DuyMinhOrg =========="
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.supplychain.com -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}Anchor.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    echo ""

}

createChannel
joinChannel
updateAnchorPeers
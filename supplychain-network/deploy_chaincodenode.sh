#!/bin/bash
source ../terminal_control.sh

export FABRIC_CFG_PATH=${PWD}/../config
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/supplychain.com/orderers/orderer.supplychain.com/msp/tlscacerts/tlsca.supplychain.com-cert.pem
export CORE_PEER_TLS_ROOTCERT_FILE_ORG1=${PWD}/organizations/peerOrganizations/DuyMinhOrg.supplychain.com/peers/peer0.DuyMinhOrg.supplychain.com/tls/ca.crt

CHANNEL_NAME="supplychain-channel"
CHAINCODE_NAME="supplychain"
CHAINCODE_VERSION="1.0"
CHAINCODE_PATH="../chaincode/assets"
CHAINCODE_LABEL="supplychain_1"

setEnvForDuyMinhOrg() {
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID=DuyMinhOrgMSP
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/DuyMinhOrg.supplychain.com/peers/peer0.DuyMinhOrg.supplychain.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/DuyMinhOrg.supplychain.com/users/Admin@DuyMinhOrg.supplychain.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}
# setEnvForDuyMinhOrg


packageChaincode() {
    rm -rf ${CHAINCODE_NAME}.tar.gz
    setEnvForDuyMinhOrg
    print Green "========== Packaging Chaincode on Peer0 DuyMinhOrg =========="
    peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CHAINCODE_PATH} --lang node --label ${CHAINCODE_LABEL}
    echo ""
    print Green "========== Packaging Chaincode on Peer0 DuyMinhOrg Successful =========="
    ls
    echo ""
}
# packageChaincode
installChaincode() {
    setEnvForDuyMinhOrg
    print Green "========== Installing Chaincode on Peer0 DuyMinhOrg =========="
    peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz --peerAddresses localhost:7051 --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE}
    print Green "========== Installed Chaincode on Peer0 DuyMinhOrg =========="
    echo ""

    
}
# installChaincode
queryInstalledChaincode() {
    setEnvForDuyMinhOrg
    print Green "========== Querying Installed Chaincode on Peer0 DuyMinhOrg=========="
    peer lifecycle chaincode queryinstalled --peerAddresses localhost:7051 --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE} >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CHAINCODE_LABEL}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    print Yellow "PackageID is ${PACKAGE_ID}"
    print Green "========== Query Installed Chaincode Successful on Peer0 DuyMinhOrg=========="
    echo ""
}
# queryInstalledChaincode
approveChaincodeByDuyMinhOrg() {
    setEnvForDuyMinhOrg
    print Green "========== Approve Installed Chaincode by Peer0 DuyMinhOrg =========="
    peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.supplychain.com --tls --cafile ${ORDERER_CA} --channelID supplychain-channel --name ${CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --package-id ${PACKAGE_ID} --sequence 1 --init-required
    print Green "========== Approve Installed Chaincode Successful by Peer0 DuyMinhOrg =========="
    echo ""
}
# approveChaincodeByDuyMinhOrg
checkCommitReadynessForDuyMinhOrg() {
    setEnvForDuyMinhOrg
    print Green "========== Check Commit Readiness of Installed Chaincode on Peer0 DuyMinhOrg =========="
    peer lifecycle chaincode checkcommitreadiness -o localhost:7050 --channelID ${CHANNEL_NAME} --tls --cafile ${ORDERER_CA} --name ${CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --sequence 1 --output json --init-required
    print Green "========== Check Commit Readiness of Installed Chaincode Successful on Peer0 DuyMinhOrg =========="
    echo ""
}
# checkCommitReadynessForDuyMinhOrg





commitChaincode() {
    setEnvForDuyMinhOrg
    print Green "========== Commit Installed Chaincode on ${CHANNEL_NAME} =========="
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.supplychain.com\
     --tls ${CORE_PEER_TLS_ENABLED} --cafile ${ORDERER_CA} --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME} \
     --peerAddresses localhost:7051 --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE_ORG1} \
     --version ${CHAINCODE_VERSION} --sequence 1 --init-required
    print Green "========== Commit Installed Chaincode on ${CHANNEL_NAME} Successful =========="
    echo ""
}
# commitChaincode
queryCommittedChaincode() {
    setEnvForDuyMinhOrg
    print Green "========== Query Committed Chaincode on ${CHANNEL_NAME} =========="
    peer lifecycle chaincode querycommitted --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME}
    print Green "========== Query Committed Chaincode on ${CHANNEL_NAME} Successful =========="
    echo ""
}
# queryCommittedChaincode
getInstalledChaincode() {
    setEnvForDuyMinhOrg
    print Green "========== Get Installed Chaincode from Peer0 DuyMinhOrg =========="
    peer lifecycle chaincode getinstalledpackage --package-id ${PACKAGE_ID} --output-directory . \--peerAddresses localhost:7051 --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE}
    print Green "========== Get Installed Chaincode from Peer0 DuyMinhOrg Successful =========="
    echo ""
}
# getInstalledChaincode
queryApprovedChaincode() {
    setEnvForDuyMinhOrg
    print Green "========== Query Approved of Installed Chaincode on Peer0 DuyMinhOrg =========="
    peer lifecycle chaincode queryapproved -C s${CHANNEL_NAME} -n ${CHAINCODE_NAME} --sequence 1 
    print Green "========== Query Approved of Installed Chaincode on Peer0 DuyMinhOrg Successful =========="
    echo ""
}
# queryApprovedChaincode
initChaincode() {
    setEnvForDuyMinhOrg
    print Green "========== Init Chaincode on Peer0 DuyMinhOrg ========== "
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.supplychain.com \
    --tls ${CORE_PEER_TLS_ENABLED} --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    --peerAddresses localhost:7051 --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE_ORG1} \
    -c '{"Args":["storeCs","100","2021-02-21T17:15:57.928Z","reco"]}' --isInit
    print Green "========== Init Chaincode on Peer0 DuyMinhOrg Successful ========== "
    echo ""
}
# initChaincode

packageChaincode
installChaincode
queryInstalledChaincode
approveChaincodeByDuyMinhOrg
checkCommitReadynessForDuyMinhOrg
commitChaincode
queryCommittedChaincode
initChaincode



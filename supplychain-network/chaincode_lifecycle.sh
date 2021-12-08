#!/bin/bash
source ../terminal_control.sh

export FABRIC_CFG_PATH=${PWD}/../config
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/supplychain.com/orderers/orderer.supplychain.com/msp/tlscacerts/tlsca.supplychain.com-cert.pem
export CORE_PEER_TLS_ROOTCERT_FILE_ORG1=${PWD}/organizations/peerOrganizations/indonesianfarmorg1.supplychain.com/peers/peer0.indonesianfarmorg1.supplychain.com/tls/ca.crt

CHANNEL_NAME="supplychain-channel"
CHAINCODE_NAME="supplychain"
CHAINCODE_VERSION="1.0"
CHAINCODE_PATH="../chaincode/supplychain/go/"
CHAINCODE_LABEL="supplychain_1"

setEnvForIndonesianFarmOrg1() {
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID=IndonesianFarmOrg1MSP
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/indonesianfarmorg1.supplychain.com/peers/peer0.indonesianfarmorg1.supplychain.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/indonesianfarmorg1.supplychain.com/users/Admin@indonesianfarmorg1.supplychain.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}
# setEnvForIndonesianFarmOrg1


packageChaincode() {
    rm -rf ${CHAINCODE_NAME}.tar.gz
    setEnvForIndonesianFarmOrg1
    print Green "========== Packaging Chaincode on Peer0 IndonesianFarmOrg1 =========="
    peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CHAINCODE_PATH} --lang golang --label ${CHAINCODE_LABEL}
    echo ""
    print Green "========== Packaging Chaincode on Peer0 IndonesianFarmOrg1 Successful =========="
    ls
    echo ""
}
# packageChaincode
installChaincode() {
    setEnvForIndonesianFarmOrg1
    print Green "========== Installing Chaincode on Peer0 IndonesianFarmOrg1 =========="
    peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz --peerAddresses localhost:7051 --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE}
    print Green "========== Installed Chaincode on Peer0 IndonesianFarmOrg1 =========="
    echo ""

    
}
# installChaincode
queryInstalledChaincode() {
    setEnvForIndonesianFarmOrg1
    print Green "========== Querying Installed Chaincode on Peer0 IndonesianFarmOrg1=========="
    peer lifecycle chaincode queryinstalled --peerAddresses localhost:7051 --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE} >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CHAINCODE_LABEL}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    print Yellow "PackageID is ${PACKAGE_ID}"
    print Green "========== Query Installed Chaincode Successful on Peer0 IndonesianFarmOrg1=========="
    echo ""
}
# queryInstalledChaincode
approveChaincodeByIndonesianFarmOrg1() {
    setEnvForIndonesianFarmOrg1
    print Green "========== Approve Installed Chaincode by Peer0 IndonesianFarmOrg1 =========="
    peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.supplychain.com --tls --cafile ${ORDERER_CA} --channelID supplychain-channel --name ${CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --package-id ${PACKAGE_ID} --sequence 1 --init-required
    print Green "========== Approve Installed Chaincode Successful by Peer0 IndonesianFarmOrg1 =========="
    echo ""
}
# approveChaincodeByIndonesianFarmOrg1
checkCommitReadynessForIndonesianFarmOrg1() {
    setEnvForIndonesianFarmOrg1
    print Green "========== Check Commit Readiness of Installed Chaincode on Peer0 IndonesianFarmOrg1 =========="
    peer lifecycle chaincode checkcommitreadiness -o localhost:7050 --channelID ${CHANNEL_NAME} --tls --cafile ${ORDERER_CA} --name ${CHAINCODE_NAME} --version ${CHAINCODE_VERSION} --sequence 1 --output json --init-required
    print Green "========== Check Commit Readiness of Installed Chaincode Successful on Peer0 IndonesianFarmOrg1 =========="
    echo ""
}
# checkCommitReadynessForIndonesianFarmOrg1





commitChaincode() {
    setEnvForIndonesianFarmOrg1
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
    setEnvForIndonesianFarmOrg1
    print Green "========== Query Committed Chaincode on ${CHANNEL_NAME} =========="
    peer lifecycle chaincode querycommitted --channelID ${CHANNEL_NAME} --name ${CHAINCODE_NAME}
    print Green "========== Query Committed Chaincode on ${CHANNEL_NAME} Successful =========="
    echo ""
}
# queryCommittedChaincode
getInstalledChaincode() {
    setEnvForIndonesianFarmOrg1
    print Green "========== Get Installed Chaincode from Peer0 IndonesianFarmOrg1 =========="
    peer lifecycle chaincode getinstalledpackage --package-id ${PACKAGE_ID} --output-directory . \--peerAddresses localhost:7051 --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE}
    print Green "========== Get Installed Chaincode from Peer0 IndonesianFarmOrg1 Successful =========="
    echo ""
}
# getInstalledChaincode
queryApprovedChaincode() {
    setEnvForIndonesianFarmOrg1
    print Green "========== Query Approved of Installed Chaincode on Peer0 IndonesianFarmOrg1 =========="
    peer lifecycle chaincode queryapproved -C s${CHANNEL_NAME} -n ${CHAINCODE_NAME} --sequence 1 
    print Green "========== Query Approved of Installed Chaincode on Peer0 IndonesianFarmOrg1 Successful =========="
    echo ""
}
# queryApprovedChaincode
initChaincode() {
    setEnvForIndonesianFarmOrg1
    print Green "========== Init Chaincode on Peer0 IndonesianFarmOrg1 ========== "
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.supplychain.com --tls ${CORE_PEER_TLS_ENABLED} --cafile ${ORDERER_CA} -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} \
    --peerAddresses localhost:7051 --tlsRootCertFiles ${CORE_PEER_TLS_ROOTCERT_FILE_ORG1} \
    --isInit -c '{"Args":[]}'
    print Green "========== Init Chaincode on Peer0 IndonesianFarmOrg1 Successful ========== "
    echo ""
}
# initChaincode

packageChaincode
installChaincode
queryInstalledChaincode
approveChaincodeByIndonesianFarmOrg1
checkCommitReadynessForIndonesianFarmOrg1
commitChaincode
queryCommittedChaincode
# initChaincode



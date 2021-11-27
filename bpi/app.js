let express = require('express')
let bodyParser = require('body-parser')

const { registerEnroll } = require('./registerEnrollClientUserOrg1')


let app = express()
app.use(bodyParser.json())

const { Gateway, Wallets } = require('fabric-network')
const path = require('path')
const fs = require('fs')
const { error } = require('console')


const cors = require('cors');
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');
const bearerToken = require('express-bearer-token');
const log4js = require('log4js');
const { response } = require('express')
const logger = log4js.getLogger('BasicNetwork');

const constants = require('./config/constants.json')

app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// set secret variable
app.set('secret', 'thisismysecret');
app.use(expressJWT({
    secret: 'thisismysecret'
}).unless({
    path: ['/','/api/registerenrolluserorg1/', '/login']
}));
app.use(bearerToken());

logger.level = 'debug';

app.use((req, res, next) => {
    
    console.log('New req for %s', req.originalUrl);
    if ( req.originalUrl.indexOf('/api/registerenrolluserorg1') >= 0 || req.originalUrl.indexOf('/login') >= 0) {
        console.log("Vo dayu")
        return next();
    }
    
    var token = req.token;
    jwt.verify(token, app.get('secret'), (err, decoded) => {
        if (err) {
            console.log(`Error ================:${err}`)
            res.send({
                success: false,
                message: 'Failed to authenticate token. Make sure to include the ' +
                    'token returned from /users call in the authorization header ' +
                    ' as a Bearer token'
            });
            
            return;
        } else {
            req.username = decoded.username;
            console.log (decoded.username);
            return next();
        }
    });
});



app.get('/', async function (req, res) {
    try {
        console.log("Test Pass!..")
        res.status(200).json({ response: "Test Pass!..."})
    } catch (error) {
        console.log("Test Fail!..")
        process.exit(1)
    }
})

app.post('/api/registerenrolluserorg1/', async function (req, res) {

    try {
        let err = await registerEnroll(req.body.username)
        if (err) {
            throw new Error(err)
        }

        res.status(201).json({ 
                status : "pass",
                message : `Successfully registered and enrolled user ${req.body.username.toUpperCase()} and imported it into the wallet`
            })
    } catch (error) {
        res.status(501).json({
        status : "fail",
        message : error.message
    })
    }
})
app.post('/login', async function (req, res){
    try {
        const username = req.body.username

        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json')
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf-8'))

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletOrg1')
        const wallet = await Wallets.newFileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`)

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username)
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet`)
            console.log('Run the registerUser.js application before retrying')
            throw new Error(`An identity for the user ${username.toUpperCase()} does not exist in the wallet`)
            return
        }
        else
        {
            var token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
                username: username
            }, app.get('secret'));
            res.status(200).json({
                result: token,
                error: "Hello"
            })
        }
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`)
        res.status(501).json({
            result: null,
            error: error.message
        })
    }
})

app.post('/api/taomathang', async function (req, res){
    try {
        const username = req.username

        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json')
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf-8'))

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletOrg1')
        const wallet = await Wallets.newFileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`)

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username)
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet`)
            console.log('Run the registerUser.js application before retrying')
            throw new Error(`An identity for the user ${username.toUpperCase()} does not exist in the wallet`)
            return
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway()
        await gateway.connect(ccp, { 
            wallet, 
            identity: username, 
            discovery: { 
                enabled: true, 
                asLocalhost: true 
                } 
        })

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('supplychain-channel')

        // Get the contract from the network.
        const contract = network.getContract('supplychain')
        let result;
        result=await contract.submitTransaction(
            'storeCs', 
            req.body.id,
            req.body.date,
            req.body.type
        )

        result = JSON.parse(result.toString());
        // const contract = network.getContract('supplychain')


        res.status(201).json({
            result: result,
            error: null
        })
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`)
        res.status(501).json({
            result: error,
            error: error.message
        })
    }
})
app.post('/api/getmathangtheonamthang', async function (req, res){
    try {
        const username = req.username

        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json')
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf-8'))

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletOrg1')
        const wallet = await Wallets.newFileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`)

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username)
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet`)
            console.log('Run the registerUser.js application before retrying')
            throw new Error(`An identity for the user ${username.toUpperCase()} does not exist in the wallet`)
            return
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway()
        await gateway.connect(ccp, { 
            wallet, 
            identity: username, 
            discovery: { 
                enabled: true, 
                asLocalhost: true 
                } 
        })

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('supplychain-channel')

        // Get the contract from the network.
        const contract = network.getContract('supplychain')
        let result;
        result=await contract.submitTransaction(
            'getCsByYearMonth', 
            req.body.date
        )

        result = JSON.parse(result.toString());
        // const contract = network.getContract('supplychain')


        res.status(201).json({
            result: result,
            error: null
        })
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`)
        res.status(501).json({
            result: error,
            error: error.message
        })
    }
})
app.post('/api/changeowner', async function (req, res){
    try {
        const username = req.username

        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json')
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf-8'))

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletOrg1')
        const wallet = await Wallets.newFileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`)

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username)
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet`)
            console.log('Run the registerUser.js application before retrying')
            throw new Error(`An identity for the user ${username.toUpperCase()} does not exist in the wallet`)
            return
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway()
        await gateway.connect(ccp, { 
            wallet, 
            identity: username, 
            discovery: { 
                enabled: true, 
                asLocalhost: true 
                } 
        })

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('supplychain-channel')

        // Get the contract from the network.
        const contract = network.getContract('supplychain')
        let result;
        result=await contract.submitTransaction(
            'changeCarOwner', 
            req.body.id,
            req.body.owner
        )

        result = JSON.parse(result.toString());
        // const contract = network.getContract('supplychain')


        res.status(201).json({
            result: result,
            error: null
        })
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`)
        res.status(501).json({
            result: error,
            error: error.message
        })
    }
})
app.post('/api/gethistory', async function (req, res){
    try {
        const username = req.username

        // load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-org1.json')
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf-8'))

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'walletOrg1')
        const wallet = await Wallets.newFileSystemWallet(walletPath)
        console.log(`Wallet path: ${walletPath}`)

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username)
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet`)
            console.log('Run the registerUser.js application before retrying')
            throw new Error(`An identity for the user ${username.toUpperCase()} does not exist in the wallet`)
            return
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway()
        await gateway.connect(ccp, { 
            wallet, 
            identity: username, 
            discovery: { 
                enabled: true, 
                asLocalhost: true 
                } 
        })

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('supplychain-channel')

        // Get the contract from the network.
        const contract = network.getContract('supplychain')
        let result;
        result=await contract.submitTransaction(
            'getHistoryForAsset', 
            req.body.id
        )

        result = JSON.parse(result.toString());
        // const contract = network.getContract('supplychain')


        res.status(201).json({
            result: result,
            error: null
        })
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`)
        res.status(501).json({
            result: error,
            error: error.message
        })
    }
})
app.listen(8081, 'localhost');
console.log('Indonesian Farm Organization 1 running on http://localhost:8081');
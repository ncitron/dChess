<template>
    <div>
        <button @click="sign">Sign Message</button>
        <br />
        <br />
        Signature: {{signature}}
        <br />
        Signature2: {{signature2}}
    </div>
</template>

<script>
    const Web3 = require('web3')
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    export default {
        data: () => ({
            signature: '',
            signature2: ''
        }),
        methods: {
            sign: async function() {
                let accounts = await web3.eth.requestAccounts()
                //let msg = 69
                //let hash = web3.utils.soliditySha3(msg)
                //this.signature = await web3.eth.personal.sign(hash, accounts[0])
                
                let nonce = '0x290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563'
                this.signature = await web3.eth.personal.sign(web3.utils.soliditySha3(0, nonce), accounts[0])
                this.signature2 = await web3.eth.sign(web3.utils.soliditySha3("\x19Ethereum Signed Message:\n32", web3.utils.soliditySha3(0, nonce)), accounts[0])
            }
        }
    }
</script>

const Chess = artifacts.require("Chess");

const emptyBoard = '0x' + Array(64).fill('0').join('')

contract("Chess Test", async accounts => {
    it("debug", async () => {
        let instance = await Chess.deployed()
        instance.createGame(accounts[0], accounts[1])
        assert.equal(true, true)
    })

    it("should verify sigs from a 2 round game", async () => {
        let instance = await Chess.deployed()
        await instance.createGame(accounts[0], accounts[1])
        let nonce = await instance.getNonce.call()

        let sig = await web3.eth.sign(web3.utils.soliditySha3(emptyBoard, nonce), accounts[0])

        //compute the next hash by hashing the previos hash with the previous sig
        let chainHash = web3.utils.soliditySha3(nonce, sig)
        let sig2 = await web3.eth.sign(web3.utils.soliditySha3(emptyBoard, chainHash), accounts[1])

        let boards = [emptyBoard, emptyBoard]
        let sigs = [sig, sig2]
        let isValid = await instance.verifyChain(boards, sigs)
        assert.equal(isValid, true)
    })

    it("should verify signatures from a multi round game", async () => {
        let instance = await Chess.deployed()
        await instance.createGame(accounts[0], accounts[1])
        let nonce = await instance.getNonce.call()

        let boards = new Array(10).fill(emptyBoard)
        let sigs = []
        let hash = nonce
        for(let i = 0; i < boards.length; i++) {
            let accountNum = i % 2 === 0 ? 0 : 1
            let sig = await web3.eth.sign(web3.utils.soliditySha3(boards[i], hash), accounts[accountNum])
            sigs.push(sig)
            hash = web3.utils.soliditySha3(hash, sig)
        }

        let isValid = await instance.verifyChain(boards, sigs)
        assert.equal(isValid, true)
    })

    it("should revert when accuseCheater is called on invalid chain", async () => {
        let instance = await Chess.deployed()
        await instance.createGame(accounts[0], accounts[1])
        let nonce = await instance.getNonce.call()

        let boards = new Array(10).fill(emptyBoard)
        let sigs = []
        let hash = nonce
        for(let i = 0; i < boards.length; i++) {
            let accountNum = i % 2 === 0 ? 0 : 1
            let sig = await web3.eth.sign(web3.utils.soliditySha3(boards[i], hash), accounts[accountNum])
            sigs.push(sig)
            hash = web3.utils.soliditySha3(hash, sig)
        }
        boards.push(emptyBoard)
        sigs.push(await web3.eth.sign(web3.utils.soliditySha3(emptyBoard, hash), accounts[5]))  //wrong account
        let revertMessage = ''
        try {
            let res = await instance.accuseCheater(boards, sigs)
        } catch(e) {
            revertMessage = e.toString().substr(0, 86)
        }
        let expectedMessage = 'Error: Returned error: VM Exception while processing transaction: revert invalid chain'
        assert.equal(revertMessage, expectedMessage)
    })

})

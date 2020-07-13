// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;
contract Chess {

    address p1;
    address p2;
    bytes32 nonce;

    function createGame(address self, address other) public {
        p1 = self;
        p2 = other;
        nonce = keccak256(abi.encodePacked(uint(blockhash(block.number-1)) + uint(p1) + uint(p2)));
    }

    function getNonce() public view returns(bytes32) {
        return nonce;
    }

    function verifyChain(bytes32[] memory boards, bytes[] memory sigs) public view returns (bool) {
        require(boards.length == sigs.length, "must have same num of moves as sigs");
        bytes32 hash = nonce;
        for(uint i = 0; i < sigs.length; i++) {
            if(i % 2 == 0) {
                bool sigValid = check(boards[i], hash, sigs[i]) == p1;
                if(!sigValid) return false;
            } else {
                bool sigValid = check(boards[i], hash, sigs[i]) == p2;
                if(!sigValid) return false;
            }
            hash = keccak256(abi.encodePacked(hash, sigs[i]));
        }
        return true;
    }

    //returns address of cheater if one is found, if not returns 0 adress
    function accuseCheater(bytes32[] memory boards, bytes[] memory sigs) public view returns (address) {
        require(verifyChain(boards, sigs) == true, "invalid chain");
        return address(0);
    }

    function check(bytes32 board, bytes32 chainHash, bytes memory sig) public pure returns(address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        bytes32 hash = keccak256(abi.encodePacked(board, chainHash));
        bytes32 data = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));

        return ecrecover(data, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        require(sig.length == 65, "wrong sig size");

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        return (v, r, s);
    }
}
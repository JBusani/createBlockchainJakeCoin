'use strict';
const SHA256 =  require('crypto-js/sha256');
const EC = require('elliptic').ec;
//this library will allow us to generate the public and private keys
//also has methods to sign somethings and verify a signature
const ec = new EC('secp256k1');


//define what a transaction looks like
class Transaction {
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress; //public key
        this.toAddress = toAddress; //public key
        this.amount = amount; //amount of coins sent
    }
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64'); //sign the hash of the transaction with the private key
        this.signature = sig.toDER('hex'); //store the signature in the transaction object
    }
    isValid(){ 
        //if the transaction is a mining reward, it is valid
        if(this.fromAddress === null) return true;
        //if there is no signature, the transaction is invalid
        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }
        //if the public key of the sender is not the same as the from address, the transaction is invalid
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{ 
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions; //the transaction such as amount, sender, receiver
        this.previousHash = previousHash; //hash of the previous block 
        this.hash = this.calculateHash();
        this.nonce = 0; //random number that has nothing to do with the block but is used to generate the hash
    }
    //calculate the hash of the block
    calculateHash(){
     return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }
    //proof of work. The more zeros the more difficult it is to mine a block
    mineBlock(difficulty){
        //substring is used to get the first few characters of the hash
        //difficulty is the number of zeros we want the hash to start with
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            //keep changing the nonce until the hash of the block starts with enough 0s
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }
    //check if all the transactions in the block are valid
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; //difficulty of the proof of work
        this.pendingTransactions = []; //transactions that are waiting to be mined for the next block
        this.miningReward = 100; //reward for mining a block
    }
    //first block on the chain is called the genesis block
    //ideally you might want this new blockchain to reflect the date of the first creation. But you need to remember time zones too.
    createGenesisBlock(){
        return new Block("08/13/2023", "Genesis block", "0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }
    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        
        console.log("Block successfully mined!");
        this.chain.push(block);
        this.pendingTransactions = [];
    }
    //add a new transaction to the pending transactions
    addTransaction(transaction){
        //check if the from and to address are filled out
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }
        this.pendingTransactions.push(transaction);
    }
    //get the balance of an address
    getBalanceOfAddress(address){
        let balance = 0;
        //loop through each block in the chain
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }
    //check if the chain is valid
    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i]; //current block
            const previousBlock = this.chain[i - 1]; //previous block
            if(!currentBlock.hasValidTransactions()){
                console.log('invalid transactions at ' + i);
                return false;
            }
            //check if the hash of the current block is still valid
            if(currentBlock.hash !== currentBlock.calculateHash()){
                console.log('invalid hash at ' + i);
                return false;
            }
            //check if the previous hash is still valid
            if(currentBlock.previousHash !== previousBlock.hash){
                console.log({
                    currentBlockPreviousHash: currentBlock.previousHash,
                    previousBlockHash: previousBlock.hash
                });
                
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;

const SHA256 =  require('crypto-js/sha256');

//define what a transaction looks like
class Transaction {
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress; //public key
        this.toAddress = toAddress; //public key
        this.amount = amount; //amount of coins sent
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
        //if I successfully mine a block, I get a reward. send it to this address
        let block = new Block(Date.now(), this.pendingTransactions);
        //in bitcoin, miners can choose which transactions to include in the block
        //in this case, we will include all pending transactions
        block.mineBlock(this.difficulty);
        console.log("Block successfully mined!");
        this.chain.push(block);
        //reset the pending transactions and send the mining reward
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];

    }
    //add a new transaction to the pending transactions
    createTransaction(transaction){
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
            //check if the hash of the current block is still valid
            if(currentBlock.hash !== currentBlock.calculateHash()){
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

let jakecoin = new Blockchain();

jakecoin.createTransaction(new Transaction('address1', 'address2', 100));
jakecoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
jakecoin.minePendingTransactions('jakes-address');

console.log('\nBalance of jake is', jakecoin.getBalanceOfAddress('jakes-address'));

console.log('\n Starting the miner again...');
jakecoin.minePendingTransactions('jakes-address');

console.log('\nBalance of jake is', jakecoin.getBalanceOfAddress('jakes-address'));
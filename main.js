const SHA256 =  require('crypto-js/sha256');

class Block{
    
    constructor(index, timestamp, data, previousHash = ''){
        this.index = index; //optional and tells us where the block sits on the chain
        this.timestamp = timestamp;
        this.data = data; //data is the transaction such as amount, sender, receiver
        this.previousHash = previousHash; //hash of the previous block 
        this.hash = this.calculateHash();
    }
    //calculate the hash of the block
    calculateHash(){
     return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }

}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];

    }
    //first block on the chain is called the genesis block
    //ideally you might want this new blockchain to reflect the date of the first creation. But you need to remember time zones too.
    createGenesisBlock(){
        return new Block(0, "08/13/2023", "Genesis block", "0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash; //previous hash is the hash of the latest block
        newBlock.hash = newBlock.calculateHash(); //recalculate the hash of the new block
        this.chain.push(newBlock);
        //in reality you can't push a new block to the chain so simply

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
jakecoin.addBlock(new Block(1, "08/12/2023", {amount: 4}));
jakecoin.addBlock(new Block(2, "08/12/2023", {amount: 10}));


console.log('Is blockchain valid? ' + jakecoin.isChainValid());

//now let's try to tamper with the chain
jakecoin.chain[1].data = {amount: 100};
jakecoin.chain[1].hash = jakecoin.chain[1].calculateHash();

console.log('Is blockchain valid? ' + jakecoin.isChainValid());

console.log(JSON.stringify(jakecoin, null, 4));
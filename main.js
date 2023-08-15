'use strict';
const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const keys = require('./env.js')

const myKey = ec.keyFromPrivate(keys.PrivateKey);

//From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic('hex');

//same for a second user
const OtherKey = ec.keyFromPrivate(keys.OtherPrivateKey);
const OtherWalletAddress = OtherKey.getPublic('hex');

//Create an instance of a Blockchain Class
let jakecoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, OtherWalletAddress, 10);
tx1.signTransaction(myKey);
jakecoin.addTransaction(tx1);


console.log('\n Starting the miner...');
jakecoin.minePendingTransactions(myWalletAddress);

console.log('\nBalance of jake is', jakecoin.getBalanceOfAddress(myWalletAddress));

console.log('\nBalance of Other is', jakecoin.getBalanceOfAddress(OtherWalletAddress));

console.log('Is Chain valid?', jakecoin.isChainValid());

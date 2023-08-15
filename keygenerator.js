const EC = require('elliptic').ec;
//this library will allow us to generate the public and private keys
//also has methods to sign somethings and verify a signature
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');
const p = require('./env.js')
console.log('Private key:', privateKey);

console.log();
console.log('Public key:', publicKey);
//the public key is the address of the user
//the private key is used to sign transactions




const keythereum = require("keythereum");

function printPrivateKey(datadir, fileName, password) {
    const keyObject = keythereum.importFromFile(fileName, datadir);
    const privateKey = keythereum.recover(password, keyObject);
    console.log(privateKey.toString('hex'));
}

function createKeystoreFile(password) {
    const params = { keyBytes: 32, ivBytes: 16 };
    var options = {
        // kdf: "scrypt", 默认是  PBKDF2-SHA256 will be used to derive the AES secret key
        kdf: "pbkdf2",
        cipher: "aes-128-ctr",
        kdfparams: {
            c: 262144,
            dklen: 32,
            prf: "hmac-sha256"
        }
    };
    const dk = keythereum.create(params);
    console.log(dk.privateKey.toString('hex'));
    const keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);
    keythereum.exportToFile(keyObject);
}


// printPrivateKey("./", "e29695f9", "jkl456");
// createKeystoreFile("jkl456");
// printPrivateKey("./", "0a18173582", "jkl456");

exports.createKeystoreFile = createKeystoreFile;
exports.printPrivateKey = printPrivateKey;
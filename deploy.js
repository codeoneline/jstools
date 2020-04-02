var fs = require('fs');
var Tx = require('ethereumjs-tx');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.0.34:6545/"));

var Const = {
  "gasPrice": 0x200000,// 这个可修改
  "gasLimit": 0x400000,
  "VAVLUE_TIMES": 0x1
}

var tokenAbi = fs.readFileSync('output/DelphyToken.abi', 'utf8');

function tryGetTransactionReceipt(hash, successCB, failedCB, tryTimesStart=100, timestep=5000) {
  var tryTimes = tryTimesStart;
  var timer = setInterval(function () {
    var receipt = web3.eth.getTransactionReceipt(hash);
    if (!receipt) {
      tryTimes--;
      if (tryTimes < 0) {
        clearInterval(timer);
        // console.log("error: out of try times: tx = " + hash)
        failedCB("out of try times: tx = " + hash);
      }
    } else {
      clearInterval(timer);

      console.log(receipt);
      if(receipt['gasUsed'] == 0x400000) {
        failedCB("out of gas");
      } else {
        successCB(receipt);
      }
    }
  }, timestep);
}

function buildSignedTransaction(priv, nonce, data, contractAddr) {
  console.log("sign: nonce="+nonce+" data="+data+" caddr="+contractAddr);
  var rawTx = {
    nonce: "0x" + nonce.toString(16),
    gasPrice: Const.gasPrice,
    gas: Const.gasLimit,
    to: contractAddr,
    value: '0x00',
    data: data
  };
  var tx = new Tx(rawTx);
  tx.sign(priv);

  var rs = "0x" + tx.serialize().toString('hex');
  return rs;
}

var tokenAddr = "0x3dd5eb90fa784126ffe02e83901d3df4c0d1e190";
var tokenContract = web3.eth.contract(JSON.parse(tokenAbi)).at(tokenAddr);

var transfer = function (priv, contractAddr, nonce, tx, callback) {
  console.log("begin: transfer" + JSON.stringify(tx));
  var privateKey = new Buffer(priv, 'hex');
  var data = tokenContract.transfer.getData(tx.to, tx.value);
  console.log("data="+data);
  var serializedTx = buildSignedTransaction(privateKey,nonce, data, tokenAddr);

  web3.eth.sendRawTransaction(serializedTx, function (err, hash) {
    if (!err) {
      var successCB = function (receipt) {
        // console.log("transfer hash success tst:" + JSON.stringify(tst)); // tst?
        // var topicsTransacts = '0x' + ethUtil.sha3('EventQXTransact(bytes32)', 256).toString('hex');
        // var topicsErrors = '0x' + ethUtil.sha3('EventError(bytes32)', 256).toString('hex');
        for (var i=0; i<receipt.logs.length; i++) {
          // var log = receipt.logs[i];
          // if (topicsTransacts === log.topics[0]) {
          //   var rt = log.data.substring(0,66);
          //   console.log(" exec sucess return  txID = " + rt);
          //   callback(null, receipt);
          //   return;
          // } else if (topicsErrors === log.topics[0]) { // error
          //   var err = log.data;
          //   var errU = web3.toUtf8(err);
          //   console.log(errU);
          // }
          callback(null, receipt);
          return;
        }
        callback("contract error: transfer ");
      };
      var failedCB = function (error) {
        callback("error: transfer " + " err=" + error);
      };
      tryGetTransactionReceipt(hash, successCB, failedCB, 100, 5000);
    } else {
      console.log("error: transfer " + err);
    }
  });
}

//
// solc --optimize --bin MetaCoin.sol
// solc --optimize --bin MetaCoin.sol | solc --link --libraries TestLib:<address>
//

var fromAddr = "0x32d192A05030F3Cf34DDb017b1306fB0E1378E1E";
var fromPrivkey = "08440f0bc565681f834f65a9c6ad4b1381f01a3785b2386622291d54f8678d9e";
var toAddr = "0x9c2f100e32c0bf0a1c0b6214007cb8c3c3a72c25"
var fromNonce = web3.eth.getTransactionCount(fromAddr);
// var bigvalue = "0x"+(new web3.BigNumber("2000")).times(Const.VAVLUE_TIMES).toString(16);
var testTx = {from:fromAddr, to:toAddr,value:web3.toWei(2000)};
web3.eth.sendTransaction({from:web3.eth.coinbase, to:toAddr, value:web3.toWei(50)});
var cb = function (err, receipt) {
  if (!err) {
    console.log("transfer success: " + JSON.stringify(receipt));
  } else {
    console.log("error: transfer " + err);
  }
}
transfer(fromPrivkey, tokenAddr, fromNonce, testTx, cb);

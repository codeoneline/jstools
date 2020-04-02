## 助记词的实现
### 第一步 提供一个熵源(initial entropy): n * 32位，一般位数(ENT)在128～256之间，
### 第二步 生成校验值 （checksum）长度为CS
    checksum = （ENT / 32）bits of SHA256(initial entropy) ===== 4~8 bits of sha256(熵源)
### 第三步 分组
    message = 熵源 + checksum，有，
    MS = ENT + CS，MS === 132～264位 将S按每11位分组，12~24个助记词，每个组在0~2047个单词中索引
### 第四步 生成助记词
    CS = ENT / 32
    MS = (ENT + CS) / 11

## 从助记词到私钥种子
### 第一步 获取一个密钥

### 第二步 使用 PBKDF2 算法生成种子
    将salted hash进行多次重复计算，这个次数是可选择的
    DK = PBKDF2(P，S，c，dkLen)

    可选项： RPF 基本伪随机函数(hLen表示伪随机函数输出的字节长度)

    输入：
        P 口令，一字节串, 这里为助记词
        S 盐值，字节串，这里为 "mnemonic" + 指定密钥
        c 迭代次数，正整数， 这里为2048
        dkLen 导出密钥的指定字节长度，正整数，最大约(2^32-1)*hLen 这里为 64
    输出：
        DK 导出密钥，长度dkLen字节

## 从助记词到以太坊地址
npm install bip39 ethereumjs-wallet ethereumjs-util --save
var bip39 = require('bip39');
var hdkey = require('ethereumjs-wallet/hdkey');
var util = require('ethereumjs-util');
###第二步：生成助记词
var mnemonic = bip39.generateMnemonic(256, null, bip39.wordlists.chinese_simplified);
###第三步：产生 HD wallet
先将 mnemonic code 转成 binary 的 seed。


var seed = bip39.mnemonicToSeed(mnemonic);
使用 seed 产生 HD Wallet，就是产生 Master Key 并记录起来。

var hdWallet = hdkey.fromMasterSeed(seed);
第四步：生成以太坊地址
产生 Wallet 中第一个帐户的第一组 keypair。可以从 Master Key，根据其路径 m/44'/60'/0'/0/0 推导出来。

var key1 = hdWallet.derivePath("m/44'/60'/0'/0/0")
使用 keypair 中的公钥产生 address。为了避免大家打错 address，一般会用 EIP55: Mixed-case checksum address encoding 再进行编码。

var address1 = util.pubToAddress(key1._hdkey._publicKey, true)
address1 = util.toChecksumAddress(address1.toString('hex'))
最后取得的 Address 会像：

0x01EcB13829fE92409112060c136885a2B73DC94d

链接：https://www.jianshu.com/p/acb58049942d

# keystore参数详解
https://munan.tech/2019/05/19/keystore/

## 后端说明
 
### npm i
### 配置 MongoDB 数据库 conf/config.js
```javascript
//conf/config.js
var exports = {
    port: 3000,
    fliePath: 'http://xxx/upload/',
    eth_account: '0xFa7...',
    eth_privateKey: '6921...',
    db_user: 'root',
    db_pwd: '123456',
    db_host: 'localhost',
    db_port: 27017,
    db_name: 'dedrops',
    db_url: function() {
        return 'mongodb://' + this.db_user + ':' + this.db_pwd + '@' + this.db_host + ':' + this.db_port + '/'
    }
}
module.exports = exports;
```
### node app.js
### 打开 http://127.0.0.1:3000/signTest/getNFTClaimData
<br>
<br>

## 服务器已安装forever
### npm install forever -g   #安装
### forever start app.js  #启动应用
### forever stop app.js  #关闭应用
### forever list #显示所有运行的服务 
<br>
<br>

## 接口说明
### 签名程序位于 routes/tools/sign.js，routes/signTest.js 为 sign.js 的使用示例
### 接口 signERC1155Claim(obj)
### 参数 
    obj.id          NFT的批次id，正整数，string类型
    obj.spender     谁能领这个NFT，string类型 
    obj.deadline    过期时间戳，单位秒，string类型
### 返回   
    data.v      用于Bank1155合约claim接口
    data.s      用于Bank1155合约claim接口
    data.r      用于Bank1155合约claim接口
    data.digest 签名的hash，用于Bank1155合约nonce接口，可以查询该签名是否已使用
<br>

### 接口 signERC20Claim(obj)
### 参数 
    obj.token       token的合约地址，string类型
    obj.spender     谁能领这个token，string类型
    obj.value       领取的数量，正整数，以token的最小单位起算，string类型
    obj.deadline    过期时间戳，单位秒，string类型
### 返回   
    data.v      用于Bank20合约claim接口
    data.s      用于Bank20合约claim接口
    data.r      用于Bank20合约claim接口
    data.digest 签名的hash，用于Bank20合约nonce接口，可以查询该签名是否已使用

<br>
<br>

### 接口 address/check(address, nftId)

#### Method
GET

#### 参数 
    address       用户地址
    nftId nftid
### 返回   
    data.match 是否达到标准
    data.nft nft信息
    data.money 资产是否达标
    data.actions 交互是否达标
    data.sign 签名信息
<br>
<br>


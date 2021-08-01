## 合约说明
### DeDropsNFT合约 0xa96e19Fd3342a52eff889EF729a81ba1Ed8a60E0
用于铸造NFT并且转入Bank1155合约，每次调用mint可以铸造一批次的NFT，批次id自增
### 写入接口 mint
### 参数 
    amount  数量，uint256类型
    info    描述，string类型
    info2   描述2，string类型
### 返回   
    无
<br>

### 读取接口 idToItem
### 参数 
    id  批次id，uint256类型
### 返回 
    id      批次id，uint256类型  
    info    描述，string类型
    info2   描述2，string类型
<br>

### 事件 event Drop(uint indexed id, uint256 amount, string info, string info2)
调用mint就会发起Drop事件，表示是这批NFT已经投放到Bank1155合约，用服务器签名可以领取NFT
<br>
<br>

### DeDropsERC合约 0xF2F2ed5f790f33e33f48D0e33addb33B002Ab4DF
用于接收空投的ERC20token并且转入Bank20合约，并且把空投信息记录上链
### 写入接口 drop
### 参数 
    token   token的合约地址，address类型
    amount  数量，uint256类型
    info    描述，string类型
    info2   描述2，string类型
### 返回   
    无
<br>

### 读取接口 idToItem
### 参数 
    id  空投活动id，uint256类型
### 返回
    id      空投活动id，uint256类型
    token   token的合约地址，address类型
    amount  数量，uint256类型
    info    描述，string类型
    info2   描述2，string类型
<br>

### 事件 event Drop(address indexed token, uint256 amount, string info, string info2)
调用drop就会发起Drop事件，表示是这批ERC已经投放到Bank20合约，用服务器签名可以领取ERC
<br>
<br>

### Bank1155合约 0xc44dc52e259352B6C26AfFcEf9ce280836AD6860
用于分发NFT，用户提交签名来领取NFT
### 写入接口 claim
### 参数 
    token       NFT的合约地址，address类型
    id          批次id，uint256类型
    owner       签名者，固定是服务器账户，address类型
    spender     谁来领，一般是调用者自己，address类型
    deadline    过期时间戳，单位秒，uint256类型
    v           签名数据，uint8类型
    r           签名数据，bytes32类型
    s           签名数据，bytes32类型
### 返回   
    无
<br>

### 读取接口 nonces
### 参数 
    bytes32      签名的digest，bytes32类型
### 返回
    bool        是否已领取，bool类型
<br>
<br>

### Bank20合约 0x13d6f4529c2a003f14cde0a356cee66637cd739a
用于分发ERC20token，用户提交签名来领取token
### 写入接口 claim
### 参数 
    token       token的合约地址，address类型
    owner       签名者，固定是服务器账户，address类型
    spender     谁来领，一般是调用者自己，address类型
    value       数量，以token的最小单位起算，uint256类型
    deadline    过期时间戳，单位秒，uint256类型
    v           签名数据，uint8类型
    r           签名数据，bytes32类型
    s           签名数据，bytes32类型
### 返回   
    无
<br>

### 读取接口 nonces
### 参数 
    bytes32     签名的digest，bytes32类型
### 返回
    bool        是否已领取，bool类型
<br>
<br>

## 流程说明
<img src="./XMind/截屏2021-07-31%2001.27.11.png">
<img src="./XMind/截屏2021-07-31%2001.30.39.png">
<img src="./XMind/截屏2021-07-31%2001.30.14.png">
<br>
<br>

## 开源代码
#### 合约 <https://github.com/DeDrops/DeDrops-contract>
#### 前端 <https://github.com/DeDrops/dedrops-interface>
#### 后端 <https://github.com/DeDrops/DeDrops-server>
<br>
<br>

## FAQ
### 为什么先筛选用户空投NFT，再对NFT持有人空投Token，直接筛选用户空投Token不好吗？
NTF是身份的象征，类似勋章，空投活动仅需要组合各类NFT便得到用户画像，避免重复筛选用户。

链上地址的历史记录通过铸造出 NFT 可以将记录保存、流转。

通过 DeDrops 铸造出的 NFT 如果被用在 DeDrops 发起的空投活动中，会被关联起来，NFT 被调用的次数多，说明该 NFT 得到认可，NFT 就产生了价值。

随着越来越多的NFT铸造出来，用户画像越来越准确，Token能够更精确空投给目标人群，能得到更多更有价值的Token空投，NFT就越有价值。
<br>

### 为什么要用离线签名？有什么优势和劣势？
离线签名可以免gas费，且处理速度很快，即使是给10万地址进行空投，大约几分钟就可以完成。如果空投给10万用户，不用离线签名的话，gas费是一笔不小的费用，且10万个交易上链也要花费很长时间。

劣势的话大概是技术会比较复杂，不过我们已经解决了。
<br>

### DeDrops的去中心化怎么说？
不论空投NFT还是Token，都是项目方直接调用合约上链，包括空投详情和领取条件也都在链上；领取的时候也是用户直接调用合约上链；合约没有治理的接口，合约的owner仅用于离线签名不需要上链，未来owner将使用多签钱包，使项目更加去中心化。
<br>

### DeDrops开发了多久？未来有什么计划？
2021年7月29号开始开发，之前做了一些框架和开发环境的准备，为了参加Layer2黑客松，7月31号第一个版本上线到Polygon。未来将部署到多条链上，用NFT的创意和免gas费及去中心化的优势，让更多的项目方使用DeDrops，使DeDrops成为用户流量入口。
<br>

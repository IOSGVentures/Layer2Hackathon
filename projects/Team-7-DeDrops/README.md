# Code
合约 <https://github.com/DeDrops/DeDrops-contract>
前端 <https://github.com/DeDrops/dedrops-interface>
后端 <https://github.com/DeDrops/DeDrops-server>

# Website
https://www.dedrops.xyz/

# Slides
https://docs.google.com/presentation/d/1dwwCJLSBYfOtnZ1ZwI2YQFL2QqlGhIfV8cQoq2cRlDo/edit?usp=sharing

# 流程说明
<img src="./contract/XMind/截屏2021-07-31%2001.27.11.png">

<img src="./contract/XMind/截屏2021-07-31%2001.30.39.png">

<img src="./contract/XMind/截屏2021-07-31%2001.30.14.png">


# FAQ
### 为什么先筛选用户空投NFT，再对NFT持有人空投Token，直接筛选用户空投Token不好吗？
NTF是身份的象征，类似勋章，空投活动仅需要组合各类NFT便得到用户画像，避免重复筛选用户。

链上地址的历史记录通过铸造出 NFT 可以将记录保存、流转。

通过 DeDrops 铸造出的 NFT 如果被用在 DeDrops 发起的空投活动中，会被关联起来，NFT 被调用的次数多，说明该 NFT 得到认可，NFT 就产生了价值。

随着越来越多的NFT铸造出来，用户画像越来越准确，Token能够更精确空投给目标人群，能得到更多更有价值的Token空投，NFT就越有价值。


### 为什么要用离线签名？有什么优势和劣势？
离线签名可以免gas费，且处理速度很快，即使是给10万地址进行空投，大约几分钟就可以完成。如果空投给10万用户，不用离线签名的话，gas费是一笔不小的费用，且10万个交易上链也要花费很长时间。

劣势的话大概是技术会比较复杂，不过我们已经解决了。


### DeDrops的去中心化怎么说？
不论空投NFT还是Token，都是项目方直接调用合约上链，包括空投详情和领取条件也都在链上；领取的时候也是用户直接调用合约上链；合约没有治理的接口，合约的owner仅用于离线签名不需要上链，未来owner将使用多签钱包，使项目更加去中心化。

### DeDrops开发了多久？未来有什么计划？
2021年7月29号开始开发，之前做了一些框架和开发环境的准备，为了参加Layer2黑客松，7月31号第一个版本上线到Polygon。未来将部署到多条链上，用NFT的创意和免gas费及去中心化的优势，让更多的项目方使用DeDrops，使DeDrops成为用户流量入口。


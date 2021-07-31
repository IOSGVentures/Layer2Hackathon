Anicent God Chinese

contracts/
    NFT/
        DCRCL1155.sol 实现了标准的CRC1155合约，并且添加了些许扩展，比如tokensof一类的函数
        TJTW.sol 西游抽卡主合约，使用DCRCL1155作为forge，其中包括设定周期、创建卡片系列、开卡池、铸造、设定价格功能等等
        DutchPricing.sol 荷兰拍价格实现
        StagedPricing.sol 阶梯定价实现
    staking/
        DAN/
            StakingBase2.sol 质押合约基类，实现了开质押池子、计算质押产出等相关算法。具体质押不同的代币，由其他类来实现(根据需求在conflux上只实现了ERC20的质押，但其他种类的质押，比如ERC1155、ERC721、ERC777的质押也可用此基类快速实现)
            StakingOperation.sol 继承了StakingBase2，实现了ERC20以及主网币的质押与提取 
            DAN.sol 实现了ERC20的TOKEN 
    utils/
        AdminAccessControl.sol 简单的管理员管理合约：创建者为第一个管理员；管理员可以添加删除管理员；提供onlyAdmin的修饰器
        EnumerableMap.sol 在openzeppling的EnumerableMap基础上提供了UintToUintMap的支持
        TimeUtil.sol 实现了简单的时间到块数的转化方法
        MinterGuard.sol 实现了基本的铸造控制
        EzSponsor.sol 简化Conflux的赞助过程
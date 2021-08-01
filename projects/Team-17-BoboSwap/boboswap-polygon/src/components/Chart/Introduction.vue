<template>
  <div class="Introduction">
    <div class="name">{{pairInfo.symbol}}</div>
    <div class="item">
      <span>发行时间</span>
      <span>{{pairInfo.introduce.issueDate}}</span>
    </div>
    <div class="item">
      <span>发行总量</span>
      <span>{{pairInfo.introduce.totalSupply}}</span>
    </div>
    <div class="item">
      <span>流通总量</span>
      <span>{{pairInfo.introduce.marketAmount}}</span>
    </div>
    <div class="item">
      <span>发行价格</span>
      <span>{{pairInfo.introduce.initPrice}}</span>
    </div>
    <div class="item_special">
      <span>白皮书</span>
      <div>
        <span class="url">{{pairInfo.introduce.whitePaperUrl}}</span
        >
        <i class="iconfont icon-copy2fuzhi"></i>
      </div>
    </div>
    <div class="item_special">
      <span>官网</span>
      <div>
        <span class="url">{{pairInfo.introduce.officialWebsite}}</span>
        <i class="iconfont icon-copy2fuzhi"></i>
      </div>
    </div>
    <div class="item_special">
      <span>区块查询</span>
      <div>
        <span class="url">{{pairInfo.introduce.tokenOnBroswer}}</span
        >
        <i class="iconfont icon-copy2fuzhi"></i>
      </div>
    </div>
    <div class="introduce_text">
      <span>简介</span>
      <span>{{pairInfo.introduce.simpleIntroduce}}</span
      >
    </div>
  </div>
</template>
<script>
export default {
  name: "Introduction",
  data() {
    return {
      pairInfo: {}
    };
  },
  created:function() {
    this.pairInfo = JSON.parse(localStorage.getItem("CurPairInfo"));
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
@import "../../assets/styles/Chart/Introduction";
</style>
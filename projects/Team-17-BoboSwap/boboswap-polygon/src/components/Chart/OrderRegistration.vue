<template>
  <div class="OrderRegistration">
    <div class="thead">
      <span>买盘 数量({{pairInfo.symbol}})</span><span>价格({{pairInfo.baseTokenName}})</span
      ><span>数量({{pairInfo.symbol}}) 卖盘</span>
    </div>
    <div class="tdata">
      <div class="td_left"><span>1</span><span>0.750656</span></div>
      <div class="td_center"><span>8017.17</span><span>8017.17</span></div>
      <div class="td_right"><span>1.000000</span><span>1</span></div>
    </div>
  </div>
</template>
<script>
export default {
  name: "OrderRegistration",
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
@import "../../assets/styles/Chart/OrderRegistration";
</style>
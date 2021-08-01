<template>
  <div class="Deal">
    <div class="thead">
      <span class="fixed_width">时间</span><span class="fixed_width">方向</span
      ><span>价格({{pairInfo.baseTokenName}})</span><span>数量({{pairInfo.symbol}})</span>
    </div>
    <div class="td_data">
      <span class="time">18:03:24</span>
      <span class="buy">买入</span>
      <span class="price">0.0003</span>
      <span class="num">900.08</span>
    </div>
    <div class="td_data">
      <span class="time">18:03:24</span>
      <span class="sell">卖出</span>
      <span class="price">0.0003</span>
      <span class="num">900.08</span>
    </div>
  </div>
</template>
<script>
export default {
  name: "Deal",
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
@import "../../assets/styles/Chart/Deal";
</style>
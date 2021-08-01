<template>
  <div class="pool">
    <div class="pool_item">
      <div class="poll_title">
        <span class="incons">
          <img src="../../assets/images/usdt.png" />
          <img src="../../assets/images/bobo.png" class="bobo" />
        </span>
        <span class="asset">BoBo/HUSD</span>
      </div>
      <div class="pool_center">
        <div class="left">
          <span>153.11%</span>
          <span>APY(参考年化收益率）</span>
        </div>
        <div class="right">
          <span>1409.37$</span>
          <span>产出 2000.16 BoBo(每日)</span>
        </div>
      </div>
      <div class="mining_btn">挖矿</div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Pool",
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="scss">
@import "../../assets/styles/Pool/Pool.scss";
</style>
<template>
  <div class="CurrentEntrust">
    <div class="lsit_item">
      <div class="type">
        <div class="type_left">
          <span class="type_text">卖出</span
          ><span class="type_asset"> FILDA/USDT </span>
        </div>
        <span class="jiaoyi_status">交易成功</span>
      </div>
      <div class="data_info">
        <div class="small_box">
          <span class="info_title">价格(USDT)</span>
          <span class="info_num">999. 0000</span>
        </div>
        <div class="small_box">
          <span class="info_title">数量(HT)</span>
          <span class="info_num">666.00</span>
        </div>
        <div class="small_box info_time">
          <span class="info_title">时间</span>
          <span class="info_num">17:1204/23</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "TransactionRecord",
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="scss">
@import "../../assets/styles/Trade/CurrentEntrust.scss";
</style>
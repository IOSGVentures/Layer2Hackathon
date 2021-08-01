<template>
  <div class="CurrentEntrust">
    <div class="lsit_item">
      <div class="type">
        <div class="type_left">
          <span class="type_text">卖出</span
          ><span class="type_asset"> {{peerToken}}/{{baseToken}} </span>
        </div>
        <span class="chexiao">撤销</span>
      </div>
      <div class="data_info">
        <div class="small_box">
          <span class="info_title">价格({{baseToken}})</span>
          <span class="info_num">11111.0000</span>
        </div>
        <div class="small_box">
          <span class="info_title">数量({{peerToken}})</span>
          <span class="info_num">1.00</span>
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
  props: ['peerToken', 'baseToken'],
  name: "CurrentEntrust",
  data() {
    return {
    };
  },
  methods: {},
};
</script>
<style lang="scss">
@import "../../assets/styles/Trade/CurrentEntrust.scss";
</style>
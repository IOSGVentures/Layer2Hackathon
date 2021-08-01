<template>
  <div class="quotation">
    <div class="quotation_nav">
      <div class="nav_left">
        <!-- <span>自选</span> -->
        <span
          v-for="(item, index) in TypeList"
          :key="index"
          :class="activeIndex == index ? 'active' : null"
          @click="chageActiveIndex(index)"
          >{{ item.id }}</span
        >
      </div>
      <!-- <img src="../../assets/images/search.png" @click="goSearch" /> -->
    </div>

    <div class="filter">
      <div class="filter_left">
        <div class="left_box">
          <span class="text">名称</span>
          <span class="filter_imgs">
            <i class="iconfont icon-up"></i>
            <i class="iconfont icon-down"></i>
          </span>
        </div>
        <div class="left_box">
          <span class="text">24H额</span>
          <span class="filter_imgs">
            <i class="iconfont icon-up"></i>
            <i class="iconfont icon-down"></i>
          </span>
        </div>
      </div>

      <div class="filter_left">
        <div class="left_box">
          <span class="text">聚合价</span>
          <span class="filter_imgs">
            <i class="iconfont icon-up"></i>
            <i class="iconfont icon-down"></i>
          </span>
        </div>
        <div class="left_box" style="margin-right: 0">
          <span class="text">涨跌幅</span>
          <span class="filter_imgs">
            <i class="iconfont icon-up"></i>
            <i class="iconfont icon-down"></i>
          </span>
        </div>
      </div>
    </div>
    <!-- list_data -->
    <div
      class="list"
      v-for="(list, listIndex) in TypeList"
      :key="listIndex"
      v-show="listIndex == activeIndex"
    >
      <div class="list_item" v-for="(item, index) in list.data" :key="index" @click="openTradePage(item)">
        <div class="item_left">
          <div class="text1">
            <span>{{ item.symbol }}</span
            ><span>/ {{ item.baseTokenName }}</span>
          </div>
          <div class="text2">24H额 {{item.volumnOf24Hours}} U</div>
        </div>
        <div class="item_right">
          <div class="right_div1"><span>--</span><span>￥**</span></div>
          <span class="right_div2" :class="item.high24h > 0 ? 'up' : 'down'"
            >{{ item.high24h > 0 ? "+" : null }}{{ item.high24h }}%</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

const aa = [];
export default {
  name: "Quotation",
  props: ["openTrade"],
  data() {
    return {
      TypeList: [],
      intervalId: 0,
      activeIndex: 0, //1:自选，2：HT,3:USDT
      syncCount: 0
    };
  },
  computed: {
    chainId() {
      return this.$store.state.chainId;
    },
  },
  async created() {
    //console.log(this.chainId);
    //console.log(this.$store.state.hangqing);
    this.intervalId = setInterval(this.showPairList, 1000);
  },

  methods: {
    showPairList() {
      let pairInfos = this.$store.state.hangqing;
      let map = {};
      if (pairInfos.length > 0) {
        this.syncCount++;
        if (this.syncCount == 5) {
          clearInterval(this.intervalId);
          this.intervalId = setInterval(this.showPairList, 15000);
        }
        for (let i = 0; i < pairInfos.length; i++) {
          let ai = pairInfos[i];
          if (!map[ai.baseTokenName]) {
            map[ai.baseTokenName] = [ai];
          } else {
            map[ai.baseTokenName].push(ai);
          }
        }
        let res = [];
        Object.keys(map).forEach((key) => {
          res.push({
            id: key,
            data: map[key],
          });
        });
        this.TypeList = res;
      }
    },
    chageActiveIndex(index) {
      this.activeIndex = index;
    },
    goSearch() {
      this.$store.dispatch("chageHeader", false);
      this.$router.push("/search");
    },
    openTradePage(curPairInfo) {
		  localStorage.setItem("CurPairInfo", JSON.stringify(curPairInfo));
      this.openTrade(curPairInfo);
    }
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/Quotation/Quotation.scss";
</style>
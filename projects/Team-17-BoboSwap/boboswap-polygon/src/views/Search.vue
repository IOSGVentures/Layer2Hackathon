<template>
  <div class="search">
    <div class="search_top">
      <el-input
        placeholder="搜索您关心的币种"
        prefix-icon="el-icon-search"
        v-model="state"
        :fetch-suggestions="aaa"
        @select="handleSelect"
        style="width: 85%"
        size="medium"
      >
      </el-input>
      <span class="cancel" @click="cancel">取消</span>
    </div>
  </div>
</template>
<script>
//const list = require("../assets/js/mock.js");
export default {
  name: "Search",
  data() {
    return {
      restaurants: [],
      state: "",
      timeout: null,
    };
  },
  mounted() {
    this.restaurants = this.loadAll();
  },
  destroyed() {},
  methods: {
    loadAll() {
      return [
        { value: "HT/USDT", id: "1" },
        { value: "BTC/USDT", id: "2" },
        { value: "ETH/USDT", id: "3" },
      ];
    },
    aaa(queryString, cb) {
      console.log(1111);
      var restaurants = this.restaurants;
      var results = queryString
        ? restaurants.filter(this.createStateFilter(queryString))
        : restaurants;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 3000 * Math.random());
    },
    createStateFilter(queryString) {
      return (state) => {
        return (
          state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    handleSelect(item) {
      console.log(item);
    },
    cancel() {
      this.$store.dispatch("chageHeader", true);
      this.$router.push("/home");
    },
  },
};
</script>
<style lang="scss" >
@import "../assets/styles/Search/Search";
</style>
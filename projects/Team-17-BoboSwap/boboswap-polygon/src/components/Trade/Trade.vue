<template>
  <div class="trade">
    <div class="trade_view">
      <div class="view_left">
        <!-- <img :src="theme == 'dark' ? view_img1 : view_img2" /> -->
        <span class="assets">{{pairInfo.symbol}}/{{pairInfo.baseTokenName}}</span>
        <span class="rate">{{ pairInfo.high24h > 0 ? "+" : null }}{{ pairInfo.high24h }}%</span>
      </div>
      <div class="view_right">
        <img src="../../assets/images/view_img2.png" @click="chart" />
        <i class="iconfont icon-more more"></i>
      </div>
    </div>
    <div class="trade_view2">
      <div class="view2_left">
        <div class="btns">
          <span :class="buy_sell ? 'buy' : null" @click="buy_sell = !buy_sell"
            >买入</span
          >
          <span :class="!buy_sell ? 'sell' : null" @click="buy_sell = !buy_sell"
            >卖出</span
          >
        </div>
        <div class="input_i">
          <el-select
            v-model="value"
            size="medium"
            popper-class="select_down"
            style="width: 100%; height: auto"
            placeholder="请选择委托类型"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
        <el-input-number
          size="medium"
          v-model="num"
          :precision="2"
          :step="0.1"
          :max="10"
          style="width: 100%"
        ></el-input-number>
      </div>
      <div class="view2_right">
        <div class="title">
          <span>数量</span>
          <span>数量</span>
        </div>
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg"></div>
        </div>
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg" style="width: 30%"></div>
        </div>
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg" style="width: 40%"></div>
        </div>
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg" style="width: 50%"></div>
        </div>
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg" style="width: 80%"></div>
        </div>
      </div>
    </div>
    <div class="view_cny">≈ 4.99 CNY</div>
    <div class="shuliang">
      <span class="position">
        <el-input
          placeholder="数量"
          class="shuliang_input"
          style="font-size: 12px"
          v-model="input"
          @input="chageSlider"
        ></el-input>
        <span class="peer_token">{{pairInfo.symbol}}</span>
      </span>
      <div class="shuliang_right">
        <span class="text_num">0.7727</span>
        <span class="shuliang_right_cny">≈ 4.99 CNY</span>
      </div>
    </div>
    <div class="slide_box">
      <div class="slide_left">
        <el-slider
          class="slide_content"
          v-model="value2"
          :step="20"
          show-stops
          @change="chageInput"
          style="width: 100%"
        ></el-slider>
        <div class="edu">
          <span>可用额度</span>
          <span>
            {{ buy_sell ? (" 0.00849345 " + pairInfo.baseTokenName) : ("49644.254894 " + pairInfo.symbol) }}</span
          >
        </div>
        <div class="edu">
          <span>预计获得</span>
          <span>
            {{ buy_sell ? ("49644.254894 " + pairInfo.symbol) : (" 0.00849345 " + pairInfo.baseTokenName) }}</span
          >
        </div>
        <div class="edu">
          <span class="huadian"
            >滑点限制<i
              class="iconfont icon-sysseting"
              @click="centerDialogVisible = true"
            ></i
          ></span>
          <span>0.1 %</span>
        </div>
      </div>
      <div class="view2_right">
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg"></div>
        </div>
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg" style="width: 30%"></div>
        </div>
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg" style="width: 40%"></div>
        </div>
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg" style="width: 50%"></div>
        </div>
        <div class="amount_item">
          <span class="span1">0.7756</span>
          <span class="span2">29.99</span>
          <div class="bg" style="width: 80%"></div>
        </div>
      </div>
    </div>
    <div :class="buy_sell ? 'buy_peer_token' : 'sell_peer_token'">
      {{ buy_sell ? "买入" : "卖出" }} {{pairInfo.symbol}}
    </div>
    <div class="waring_tips">
      <img src="../../assets/images/waring_icon.png" />
      <span>请谨慎投资。点击了解更多查看全球观察区详情。</span>
    </div>
    <div class="line_box"></div>
    <div class="list_box">
      <div class="list_nav">
        <span
          :class="listInde ? 'list_nav_active' : null"
          @click="listInde = !listInde"
          >当前委托</span
        ><span
          :class="!listInde ? 'list_nav_active' : null"
          @click="listInde = !listInde"
          >成交记录</span
        >
      </div>
      <CurrentEntrust v-if="listInde"/>
      <TransactionRecord v-else />
      <el-dialog
        title="交易设置"
        :visible.sync="centerDialogVisible"
        width="90%"
        center
      >
        <SlidingPointDialog />
      </el-dialog>
    </div>
  </div>
</template>

<script>
let view_img1 = require("../../assets/images/view_img1.png");
let view_img2 = require("../../assets/images/view_img3.png");
import CurrentEntrust from "./CurrentEntrust";
import TransactionRecord from "./TransactionRecord";
import SlidingPointDialog from "./SlidingPointSetingDialog";
import ERC20 from "../../assets/contracts/abi/ERC20.json";

export default {
  name: "Trade",
  data() {
    return {
      buy_sell: true,
      listInde: true,
      view_img1: view_img1,
      view_img2: view_img2,
      input: "",
      num: 1,
      value2: 0,
      centerDialogVisible: false,
      options: [
        {
          value: "市价委托",
          label: "市价委托",
        },
        {
          value: "限价委托",
          label: "限价委托",
        },
      ],
      value: "",
      pairInfo: {},
      pairIntervalId: 0
    };
  },
  created:function() {
    this.pairInfo = JSON.parse(localStorage.getItem("CurPairInfo"));
          
    this.pairIntervalId = setInterval(() => {
      let pairInfos = this.$store.state.hangqing.filter(pairInfo => (pairInfo.symbol == this.pairInfo.symbol) && (pairInfo.baseTokenName == this.pairInfo.baseTokenName));
      this.pairInfo.high24h =  pairInfos[0].high24h;
    }, 3000);
    var baseTokenContract = {
      contractName: this.pairInfo.baseTokenName,
      web3Contract: new this.$store.state.web3.eth.Contract(ERC20, this.pairInfo.baseTokenAddr)
    }
    this.$store.state.drizzle.addContract(baseTokenContract, []);

    var peerTokenContract = {
      contractName: this.pairInfo.symbol,
      web3Contract: new this.$store.state.web3.eth.Contract(ERC20, this.pairInfo.address)
    }
    this.$store.state.drizzle.addContract(peerTokenContract, []);

    this.$store.state.drizzle.contracts[this.pairInfo.baseTokenName]
      .methods.balanceOf(this.$store.state.account)
      .call()
      .then(v => {
        console.log('balance=', v)
      });

  },
  beforeDestroy() {
    clearInterval(this.pairIntervalId);
  },
  computed: {
    theme() {
      return this.$store.state.skin;
    },
  },
  components: { CurrentEntrust, TransactionRecord, SlidingPointDialog },
  methods: {
    chageInput(value) {
      //sliderChage
      this.input = value;
    },
    chageSlider(value) {
      //inputChange
      this.value2 = Number(value);
    },
    chart() {
      this.$store.dispatch("chageHeader", false);
      this.$router.push("/chart");
    },
  },
};
</script>
<style  lang="scss">
@import "../../assets/styles/Trade/Trade";
</style>

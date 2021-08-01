<template>
  <div class="ChartChild">
    <div class="nav">
      <!-- <span class="nav_text nav_active">分时</span> -->
      <span
        class="nav_text"
        :class="selectIndx == 1 ? 'nav_active' : null"
        @click="changeSelect(15, 'min', 1)"
        >15分</span
      >
      <span
        class="nav_text"
        :class="selectIndx == 2 ? 'nav_active' : null"
        @click="changeSelect(1, 'hour', 2)"
        >1小时</span
      >
      <span
        class="nav_text"
        :class="selectIndx == 3 ? 'nav_active' : null"
        @click="changeSelect(4, 'hour', 3)"
        >4小时</span
      >
      <span
        class="nav_text"
        :class="selectIndx == 4 ? 'nav_active' : null"
        @click="changeSelect(1, 'day', 4)"
        >1日</span
      >
      <span
        class="nav_text"
        :class="selectIndx == 5 ? 'nav_active' : null"
        @click="changeSelect(1, 'week', 5)"
        >1周</span
      >
      <span
        class="nav_text addicon"
        :class="{ addicon_active: show3, nav_active: selectIndx == 6 }"
        @click="show3 = !show3"
        ><span>{{ selectText }}</span
        ><i class="iconfont icon-more1"></i
      ></span>
    </div>
    <el-collapse-transition name="el-fade-in-linear">
      <div v-show="show3" class="select_box" @click="closeMsg($event)">
        <div class="box" ref="msk">
          <span
            class="box_item"
            @click="selectHandler(1, 'min', 1)"
            :class="{ active: box_item_index == 1 }"
            >1分</span
          ><span
            class="box_item"
            @click="selectHandler(5, 'min', 2)"
            :class="{ active: box_item_index == 2 }"
            >5分</span
          ><span
            class="box_item"
            @click="selectHandler(30, 'min', 3)"
            :class="{ active: box_item_index == 3 }"
            >30分</span
          ><span
            class="box_item"
            @click="selectHandler(1, 'mounth', 4)"
            :class="{ active: box_item_index == 4 }"
            >1月</span
          >
        </div>
      </div>
    </el-collapse-transition>
    <div class="line"></div>
    <div id="main" style="width: 100%; height: 400px; min-height: 200px"></div>
    <div class="line"></div>
  </div>
</template>
<script>
import * as echarts from "echarts/core";
import {
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  LegendComponent,
  BrushComponent,
  DataZoomComponent,
  TitleComponent,
  TimelineComponent,
  CalendarComponent,
} from "echarts/components";
import { CandlestickChart, LineChart, BarChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  LegendComponent,
  BrushComponent,
  DataZoomComponent,
  CandlestickChart,
  LineChart,
  BarChart,
  CanvasRenderer,
  TitleComponent,
  TimelineComponent,
  CalendarComponent,
]);
var ROOT_PATH =
  "https://cdn.jsdelivr.net/gh/apache/echarts-website@asf-site/examples";

var option;

var upColor = "#00da3c";
var downColor = "#ec0000";
export default {
  name: "ChartChild",
  data() {
    return {
      show3: false,
      selectIndx: 1,
      selectText: "更多",
      box_item_index: 0,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.drawLine();
    });
  },
  methods: {
    closeMsg(ev) {
      if (!this.$refs.msk.contains(ev.target)) {
        this.show3 = false;
      }
    },
    changeSelect(value, type, index) {
      this.box_item_index = 0;
      this.selectIndx = index;
      this.selectText = "更多";
    },
    selectHandler(v, wei, index) {
      let text = "";
      switch (wei) {
        case "min":
          text = "分";
          break;
        case "hour":
          text = "时";
          break;
        case "day":
          text = "天";
          break;
        case "week":
          text = "周";
          break;
        case "mounth":
          text = "月";
          break;
      }
      this.selectText = v + text;
      this.selectIndx = 6;
      this.show3 = false;
      this.box_item_index = index;
    },
    drawLine() {
      var chartDom = document.getElementById("main");
      let skin = localStorage.getItem("Skin");
      let bgcolor = "";
      skin == "dark" ? (bgcolor = "#152131") : (bgcolor = "#fff");
      var myChart = echarts.init(chartDom, skin);

      this.$axios
        .get(ROOT_PATH + "/data/asset/data/stock-DJI.json")
        .then((rawData) => {
          var data = this.splitData(rawData.data);
          myChart.setOption(
            (option = {
              animation: false,
              backgroundColor: bgcolor,
              legend: {
                bottom: 100,
                data: ["MA5", "MA10", "MA20", "MA30"],
                left: 0,
              },
              tooltip: {
                trigger: "axis",
                axisPointer: {
                  type: "cross",
                },
                backgroundColor: "rgba(00, 00, 00, 0.8)",
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                textStyle: {
                  color: "#fff",
                  fontSize: 8,
                },
                position: function (pos, params, el, elRect, size) {
                  var obj = { top: 10 };
                  obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                  return obj;
                },
              },
              axisPointer: {
                link: { xAxisIndex: "all" },
                label: {
                  backgroundColor: "#777",
                },
              },
              visualMap: {
                show: false,
                seriesIndex: 5,
                dimension: 2,
                pieces: [
                  {
                    value: 1,
                    color: upColor,
                  },
                  {
                    value: -1,
                    color: downColor,
                  },
                ],
              },
              grid: [
                {
                  left: 0,
                  right: 0,
                  height: "65%",
                  width: "100%",
                  top: "10px",
                },
                {
                  left: 0,
                  right: 0,
                  top: "75%",
                  height: "16%",
                  width: "100%",
                },
              ],
              xAxis: [
                {
                  type: "category",
                  data: data.categoryData,
                  scale: true,
                  boundaryGap: false,
                  axisLine: { onZero: false },
                  axisTick: { show: false },
                  splitLine: { show: true },
                  axisLabel: { show: false },
                  splitNumber: 20,
                  min: "dataMin",
                  max: "dataMax",
                  axisPointer: {
                    z: 100,
                  },
                },
                {
                  type: "category",
                  gridIndex: 1,
                  data: data.categoryData,
                  scale: true,
                  boundaryGap: false,
                  axisLine: { onZero: false },
                  axisTick: { show: false },
                  splitLine: { show: false },
                  axisLabel: { show: true },
                  splitNumber: 20,
                  min: "dataMin",
                  max: "dataMax",
                },
              ],
              yAxis: [
                {
                  type: "value",
                  position: "right",
                  offset: -55,
                  scale: true,
                  splitArea: {
                    show: true,
                  },
                },
                {
                  scale: true,
                  gridIndex: 1,
                  splitNumber: 2,
                  axisLabel: { show: false },
                  axisLine: { show: false },
                  axisTick: { show: false },
                  splitLine: { show: false },
                },
              ],
              dataZoom: [
                {
                  type: "inside",
                  xAxisIndex: [0, 1],
                  start: 98,
                  end: 100,
                },
              ],
              series: [
                {
                  name: "指数",
                  type: "candlestick",
                  data: data.values,
                  itemStyle: {
                    color: downColor,
                    color0: upColor,
                    borderColor: null,
                    borderColor0: null,
                  },
                  tooltip: {
                    formatter: function (param) {
                      param = param[0];
                      return [
                        "Date: " +
                          param.name +
                          '<hr size=1 style="margin: 3px 0">',
                        "open: " + param.data[0] + "<br/>",
                        "close: " + param.data[1] + "<br/>",
                        "lowest: " + param.data[2] + "<br/>",
                        "highest: " + param.data[3] + "<br/>",
                      ].join("");
                    },
                  },
                },
                {
                  name: "MA5",
                  type: "line",
                  data: this.calculateMA(5, data),
                  smooth: true,
                  symbol: "none",
                  lineStyle: {
                    opacity: 0.5,
                    width: 1,
                  },
                },
                {
                  name: "MA10",
                  type: "line",
                  data: this.calculateMA(10, data),
                  smooth: true,
                  symbol: "none",
                  lineStyle: {
                    opacity: 0.5,
                    width: 1,
                  },
                },
                {
                  name: "MA20",
                  type: "line",
                  data: this.calculateMA(20, data),
                  smooth: true,
                  symbol: "none",
                  lineStyle: {
                    opacity: 0.5,
                    width: 1,
                  },
                },
                {
                  name: "MA30",
                  type: "line",
                  data: this.calculateMA(30, data),
                  smooth: true,
                  symbol: "none",
                  lineStyle: {
                    opacity: 0.5,
                    width: 1,
                  },
                },
                {
                  name: "成交量",
                  type: "bar",
                  xAxisIndex: 1,
                  yAxisIndex: 1,
                  data: data.volumes,
                },
              ],
            }),
            true
          );

          myChart.dispatchAction({
            type: "brush",
            areas: [
              {
                brushType: "lineX",
                coordRange: ["2016-06-02", "2016-06-20"],
                xAxisIndex: 0,
              },
            ],
          });
        });

      option && myChart.setOption(option);
    },
    splitData(rawData) {
      var categoryData = [];
      var values = [];
      var volumes = [];
      for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i]);
        volumes.push([
          i,
          rawData[i][4],
          rawData[i][0] > rawData[i][1] ? 1 : -1,
        ]);
      }

      return {
        categoryData: categoryData,
        values: values,
        volumes: volumes,
      };
    },
    calculateMA(dayCount, data) {
      var result = [];
      for (var i = 0, len = data.values.length; i < len; i++) {
        if (i < dayCount) {
          result.push("-");
          continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
          sum += data.values[i - j][1];
        }
        result.push(+(sum / dayCount).toFixed(3));
      }
      return result;
    },
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/Chart/ChartChild";
</style>
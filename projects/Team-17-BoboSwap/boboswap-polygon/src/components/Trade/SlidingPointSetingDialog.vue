<template>
  <div class="seting">
    <div class="seting_1">
      <span>滑点设置</span>
      <el-popover
        placement="top"
        width="200"
        trigger="click"
        content="设置滑点后,如果成交价变化超过设置值,订单将会无法成交。"
      >
        <i class="iconfont icon-help help" slot="reference"></i>
      </el-popover>
    </div>
    <el-input
      placeholder="0.1"
      size="small"
      class="input1"
      v-model.number="sliding_num"
      type="number"
    >
      <template slot="append">%</template>
    </el-input>
    <el-button-group class="btngroup">
      <el-button size="mini">0.5</el-button>
      <el-button size="mini">1%</el-button>
      <el-button size="mini">5%</el-button>
      <el-button size="mini">10%</el-button>
    </el-button-group>
    <div class="seting_1">
      <span>交易超时时间</span>
      <el-popover
        placement="top"
        width="200"
        trigger="click"
        content="设置超时时间后,如果订单超过设置值还未成交,订单将被取消。"
      >
        <i class="iconfont icon-help help" slot="reference"></i>
      </el-popover>
    </div>
    <el-input
      placeholder="20"
      size="small"
      class="input1"
      v-model.number="sliding_time"
      type="number"
    >
      <template slot="append">分钟</template>
    </el-input>
    <div class="save">保存</div>
  </div>
</template>
<script>
export default {
  name: "SlidingPointDialog",
  data() {
    return {
      sliding_num: "",
      sliding_time: "",
    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/base";
.seting {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  .seting_1 {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    span {
      font-size: 13px;
      @include text-color(title-text);
      margin-right: 5px;
    }
    i {
      font-size: 18px;
      @include text-color(title-text);
    }
  }
  .input1,
  .btngroup {
    margin: 13px 0;
  }
  .btngroup {
    margin-bottom: 25px;
  }
  .save {
    width: 100%;
    height: 35px;
    background: #1da57a;
    color: #fff;
    text-align: center;
    line-height: 35px;
    margin-top: 20px;
    font-size: 14px;
  }
}

.el-input-group__append,
.el-input-group__prepend {
  @include bg-color(input-group);
  border: none;
}
.el-button {
  @include bg-color(input-group);
  @include text-color(title-text);
}
.el-button:focus,
.el-button:hover {
  @include bg-color(input-group);
  @include text-color(title-text);
}
</style>
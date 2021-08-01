// rem等比适配配置文件
// 基准大小
const baseSize = 16
function setRem () {
  // 当前页面宽度相对于 768宽的缩放比例，ipad宽度为基准。
  const scale = document.documentElement.clientWidth / 750
  document.documentElement.style.fontSize = baseSize * Math.min(scale, 2) + 'px'
}
// 初始化
setRem()
// 改变窗口大小时重新设置 rem
window.onresize = function () {
  setRem()
}
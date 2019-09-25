<template>
  <div ref="echarts" style="width: 100%; height: 200px;"></div>
</template>

<script>
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
// import 'echarts/lib/component/axis'
import 'echarts/lib/component/title'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/visualMap'

export default {
  name: 'GraphIndex',
  props: {
    data: {
      type: Array,
      default: () => ([])
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    data() {
      const data = this.data
      if (Array.isArray(data)) {
        this.initChart()
      }
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      const { data } = this
      this.chart = echarts.init(this.$refs['echarts'])
      const options = {
        title: {
          text: 'Beijing AQI'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          data: data.map(function (item) {
            return {
              value: item,
              textStyle: {
                color: 'transparent'
              }
            }
          }),
          showLabel: false
        },
        yAxis: {
          splitLine: {
            show: false
          }
        },
        visualMap: {
          top: 10,
          right: 10,
          pieces: [{
            // value: 0,
            lte: 0,
            label: '0: 其他',
            color: '#4c52ea'
          }, {
            // value: 1,
            gt: 0,
            lte: 1,
            label: '1: 其他',
            color: '#243950'
          }, {
            // value: 2,
            gt: 1,
            lte: 2,
            label: '2: 喜悦',
            color: '#0e332a'
          }, {
            // value: 3,
            gt: 2,
            lte: 3,
            label: '3: 愤怒',
            color: '#f94c99'
          }, {
            // value: 4,
            gt: 3,
            lte: 4,
            label: '4: 悲伤',
            color: '#184af0'
          }, {
            // value: 5,
            gt: 4,
            lte: 5,
            label: '5: 惊恐',
            color: '#1c504d'
          }, {
            // value: 6,
            gt: 5,
            lte: 6,
            label: '6: 厌恶',
            color: '#7e1d63'
          }, {
            // value: 7,
            gt: 6,
            lte: 7,
            label: '7: 中性',
            color: '#7e2a14'
          }],
          outOfRange: {
            color: '#999'
          }
        },
        series: {
          name: 'Beijing AQI',
          type: 'line',
          data: data.map(function (item) {
            return item
          }),
          markLine: {
            silent: true,
            data: [{
              yAxis: 1
            }, {
              yAxis: 2
            }, {
              yAxis: 3
            }, {
              yAxis: 4
            }, {
              yAxis: 5
            }, {
              yAxis: 6
            }, {
              yAxis: 7
            }]
          }
        }
      }
      // 把配置和数据放这里
      this.chart.setOption(options)
    }
  }
}
</script>

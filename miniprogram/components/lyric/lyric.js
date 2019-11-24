// components/lyric/lyric.js
let lyricHeight = 0;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false,
    },
    lyric: String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0, // 当前选中的歌词的索引
    scrollTop: 0, // 滚动条滚动的高度
    isSame: false, // 是否为同一首歌
  },

  observers: {
    lyric(lrc) {
      if (lrc == '暂无歌词') {
        this.setData({
          lrcList: [{
            lrc,
            time: 0,
          }],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc)
      }
      // console.log(lrc)
    },
  },

  lifetimes: {
    ready() {
      //获取设备信息
      wx.getSystemInfo({
        success(res) {
          // wxss规定屏幕宽为750rpx
          // console.log(res)
          //  屏幕宽度px / 750 = 求出1rpx的大小
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //更新歌词,显示高亮
    update(currentTime) {
      let lrcList = this.data.lrcList
      if (lrcList.length == 0) {
        return
      }
      if (currentTime > lrcList[lrcList.length - 1].time) {
        if (this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for (let i = 0; i < lrcList.length; i++) {
        //当前时间小于等于上一条时,高亮显示上一条
        if (currentTime <= lrcList[i].time) {
          // console.log(currentTime, lrcList[i].time)
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }

    },

    //解析歌词
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      // console.log(line)
      let _lrcList = []
      line.forEach((item) => {
        //获取每条歌词时间
        let time = item.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)

        if (time != null) {
          let lrc = item.split(time)[1]
          //拆分为分,秒,毫秒
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间转换为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time: time2Seconds,
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
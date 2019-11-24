// components/proogress-bar/progress-bar.js
let movableAreaWidth = 0;
let movableViewWidth = 0;
const backgroundAudioManager = wx.getBackgroundAudioManager();
let currentSec = -1 // 当前的秒数
let duration = 0 // 当前歌曲的总时长，以秒为单位
let isMoving = false // 表示当前进度条是否在拖拽，解决：当进度条拖动时候和updatetime事件有冲突的问题
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    movableDis: 0,
    progress: 0,
  },

  //定义组件生命周期
  lifetimes: {
    ready() {
      if (this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 拖动
    onChange(event) {
      // console.log(event)
      if (event.detail.source == 'touch') {
        //this.data是用来获取页面data对象的，而this.setData是用来更新界面的
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },

    //触摸结束
    onTouchEnd() {
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      //定位到指定时间播放(单位秒)
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
      // console.log('end', isMoving)
    },

    //获取组件的长度
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },

    //媒体组件
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        isMoving = false;
        this.triggerEvent('musicPlay');
      })

      backgroundAudioManager.onStop(() => {

      })

      backgroundAudioManager.onPause(() => {
        this.triggerEvent('musicPause');
      })

      backgroundAudioManager.onWaiting(() => {})

      backgroundAudioManager.onCanplay(() => {
        // console.log(backgroundAudioManager.duration)
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          //为了兼容,一秒后获取
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })

      backgroundAudioManager.onTimeUpdate(() => {
        if (!isMoving) {
          const currentTime = backgroundAudioManager.currentTime;
          duration = backgroundAudioManager.duration;
          const currentTimeFmt = this._dateFormat(currentTime);
          //减少setData次数,优化效率,每一秒执行一次
          const sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) {
            this.setData({
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
            })
            currentSec = sec;

            // 联动歌词,子组件通过事件向父组件
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      })

      backgroundAudioManager.onEnded(() => {
        //传给父组件的事件
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError((res) => {

      })
    },

    _setTime() {
      //获取歌曲时长(单位秒)
      duration = backgroundAudioManager.duration
      const durationFmt = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },

    // 格式化时间
    _dateFormat(sec) {
      // 分钟
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec),
      }
    },

    // 补零
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }

  }
})
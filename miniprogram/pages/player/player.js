// pages/player/player.js

let musicList = [];
// 正在播放歌曲的index
let nowPlayingIndex = 0;
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager();
//获取app.js里的属性和方法
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false,
    isLyricShow: false,
    lyric: '',
    isSame: false, // 是否为同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    nowPlayingIndex = options.index;
    musicList = wx.getStorageSync('musicList');
    this._loadMusicDetail(options.musicId);
  },

  //切换播放状态
  togglePlaying() {
    if (this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  //保存播放历史
  savePlayHistory() {
    const music = musicList[nowPlayingIndex]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    let isSave = history.some(item => item.id == music.id)
    if (!isSave) {
      history.unshift(music)
      wx.setStorageSync(openid, history)
    }
  },

  //上一首
  onPrev() {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musicList.length - 1
    }
    this._loadMusicDetail(musicList[nowPlayingIndex].id)
  },

  //下一首
  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musicList.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musicList[nowPlayingIndex].id)
  },

  //歌词显示或隐藏
  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  onPlay() {
    this.setData({
      isPlaying: true
    })
  },

  onPause() {
    this.setData({
      isPlaying: false
    })
  },

  //加载歌曲
  _loadMusicDetail(musicId) {
    if (musicId == app.getPlayMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }

    if (!this.data.isSame) {
      backgroundAudioManager.stop()
    }

    wx.showLoading({
      title: '歌曲加载中',
    })
    let music = musicList[nowPlayingIndex];
    wx.setNavigationBarTitle({
      title: music.name
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    //设置全局musicId
    app.setPlayMusicId(musicId)

    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl',
      }
    }).then((res) => {
      let result = JSON.parse(res.result);
      if (result.data[0].url) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
        this.setData({
          isPlaying: true
        })
        wx.hideLoading();
        this.savePlayHistory();

        // 加载歌词
        wx.cloud.callFunction({
          name: 'music',
          data: {
            musicId,
            $url: 'lyric',
          }
        }).then((res) => {
          let lyric = '暂无歌词'
          const lrc = JSON.parse(res.result).lrc
          if (lrc) {
            lyric = lrc.lyric
          }
          this.setData({
            lyric
          })
        })
      } else {
        this.onNext();
        return
      }
    })
  },

  //把歌曲当前进度时间传给歌词组件
  timeUpdate(event) {
    //调用歌词组件的 update方法,传入currentTime
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
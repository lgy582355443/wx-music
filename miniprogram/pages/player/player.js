// pages/player/player.js

let musicList = [];
// 正在播放歌曲的index
let nowPlayingIndex = 0;
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false
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

  //上一首
  onPrev() {
    nowPlayingIndex--;
    if (nowPlayingIndex === 0) {
      nowPlayingIndex = musicList.length - 1;
    }
    this._loadMusicDetail(musicList[nowPlayingIndex].id)
  },

  //下一首
  onNext() {
    nowPlayingIndex++;
    if (nowPlayingIndex === musicList.length - 1) {
      nowPlayingIndex = 0;
    }
    this._loadMusicDetail(musicList[nowPlayingIndex].id)
  },

  //加载歌曲
  _loadMusicDetail(musicId) {
    backgroundAudioManager.stop()
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
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl',
      }
    }).then((res) => {
      let result = JSON.parse(res.result);
      backgroundAudioManager.src = result.data[0].url
      backgroundAudioManager.title = music.name
      backgroundAudioManager.coverImgUrl = music.al.picUrl
      backgroundAudioManager.singer = music.ar[0].name
      backgroundAudioManager.epname = music.al.name
      this.setData({
        isPlaying: true
      })
      wx.hideLoading()
    })
  },


  // /防抖debounce代码：
  debounce(fn, delay) {
    var timeout = null;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn();
    }, delay);
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
// components/musiclist/musiclist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(e) {
      console.log(e);
      const ds = e.currentTarget.dataset;
      this.setData({
        playingId: ds.musicId
      })
      wx.navigateTo({
        url: `/pages/player/player?musicId=${ds.musicId}&index=${ds.index}`,
      })
    }
  }
})
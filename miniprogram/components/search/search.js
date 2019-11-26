// components/search/search.js
let keyWord = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: "请输入关键字"
    }
  },

  //引入父组件传入的class
  externalClasses: [
    'iconfont',
    'icon-sousuo',
  ],


  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event) {
      // console.log(event)
      keyWord = event.detail.value
    },

    onSearch() {
      this.triggerEvent('search', {
        keyWord
      })
    },
  }
})
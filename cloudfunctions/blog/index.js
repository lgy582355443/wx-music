// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')
const db = cloud.database()
const blogCollection = db.collection('blog')
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('list', async(ctx, next) => {
    const keyWord = event.keyWord
    let w = {}
    if (keyWord.trim() != '') {
      w = {
        content: new db.RegExp({
          regexp: keyWord,
          options: 'i'
        })
      }
    }
    let blogList = await blogCollection
      .where(w)
      .skip(event.start, event)
      .limit(event.count)
      .orderBy('createTime', 'desc').get().then((res) => {
        return res.data
      })
    ctx.body = blogList
  })

  return app.serve()
}
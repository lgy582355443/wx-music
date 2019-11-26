// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exp// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()

  const result = await cloud.openapi.templateMessage.send({
    touser: OPENID,
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      keyword1: {
        value: '评价完成'
      },
      keyword2: {
        value: event.content
      }
    },
    templateId: '5gJb14XiYaKnVup4ozeEe46cPqDrgtszozLKWpEy7nw',
    formId: event.formId
  })
  return result
}
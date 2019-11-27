// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  //给二维码传参,知道是谁生成的二维码
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID,
    // page: "pages/blog/blog"
    // lineColor: {
    //   'r': 211,
    //   'g': 60,
    //   'b': 57
    // },
    // isHyaline: true
  })
  // console.log(result)

  //把二维码图片上传云存储
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png',
    fileContent: result.buffer
  })
  return upload.fileID

}
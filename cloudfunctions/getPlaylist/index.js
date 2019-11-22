// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//初始化云数据库
const db = cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

//每次最多只能获取100条
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {

  // const list = await playlistCollection.get()
  //获取云数据库歌单总条数
  const countResult = await playlistCollection.count()
  const total = countResult.total
  //需要请求的次数
  const batchTimes = Math.ceil(total / MAX_LIMIT)

  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((pev, cur) => {
      return {
        data: pev.data.concat(cur.data)
      }
    })
  }

  //远程更新的歌单
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })

  //远程更新的歌单与云数据库比较,把不相同存入云数据库
  let newDate = []
  for (let i = 0; i < playlist.length; i++) {
    let flag = true
    for (let j = 0; j < list.data.length; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if (flag) {
      newDate.push(playlist[i])
    }
  }

  //把新增歌单加入数据库
  for (let i = 0; i < newDate.length; i++) {
    await playlistCollection.add({
      data: {
        ...newDate[i],
        createTime: db.serverDate(),
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.log('插入失败')
    })
  }
  return newDate.length
}
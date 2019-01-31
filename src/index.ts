// RESTサーバをつくってみる
// npm install --save express cors  body-parser
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'

const app = express()

// Automatically allow cross-origin requests
app.use(cors({ origin: true }))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

import * as mysql from 'mysql'

const server = app.listen(3000, function() {
  console.log("Node.js is listening to PORT:" + server.address().port)
})

import config from './config'
import * as util from 'util'

let mysqlPool

// 以下、RESTサーバをつくる
// https://qiita.com/uenosy/items/ba9dbc70781bddc4a491
app
  .route("/users")
  .all((req, res, next) => {
    console.log("Request 受信")
    if (!mysqlPool) {
      mysqlPool = mysql.createPool(config)
      mysqlPool.query = util.promisify(mysqlPool.query)
    }
    next()
  })

  // findAll
  // status 200
  // 結果配列を返す
  .get(async (req, res) => {
    console.log("find all")
    try{
      const rows = await mysqlPool.query("select * from  USER_MASTER;")
      if(rows.length === 0){
        res.status(404).send()
        return
      }
      res.json(rows)
    }catch(err){
      console.log("err: " + err)
      res.status(500).send(err)
    }
  })

  // create
  // status 201
  // 作成したオブジェクトを返す
  .post(async (req, res) => {
    console.log("create")
    const user = req.body
    console.log(JSON.stringify(user))
   
    try{
      await mysqlPool.query(
        "insert into USER_MASTER set ?",user)
      const rows = await mysqlPool.query(
          "select * from  USER_MASTER where COMPANY_CD = ? and LOGIN_ID = ? ;",
          [user.COMPANY_CD, user.LOGIN_ID])
      res.status(201).json(rows[0])
    }catch(err){
      console.log("err: " + err)
      res.status(500).send(err)
    }
  })

  // update
  // status 200
  // 作成したオブジェクトを返す
  .put(async (req, res) => {
    console.log("update")
    const user = req.body
    console.log(JSON.stringify(user))
    const companyCode = user.COMPANY_CD
    const loginId = user.LOGIN_ID
    const userName = user.USER_NAME
    try{
      const rows = await mysqlPool.query(
        "update USER_MASTER set COMPANY_CD = ? ,LOGIN_ID = ? ,USER_NAME = ? where COMPANY_CD = ? and LOGIN_ID = ?",
        [companyCode, loginId, userName, companyCode, loginId]
      );
      res.status(200).json(rows[0])
      // res.status(204).send();
    }catch(err){
      console.log("err: " + err)
      res.status(500).send(err)
    }
  })

// PK検索
// status 200
// 検索したオブジェクト(配列)を返す
app.get("/users/:key1/:key2",async (req, res) => {
  console.log("find by pk")
  if (!mysqlPool) {
    mysqlPool = mysql.createPool(config)
    mysqlPool.query = util.promisify(mysqlPool.query)
  }

  try{
    const rows = await mysqlPool.query(
      "select * from  USER_MASTER where COMPANY_CD = ? and LOGIN_ID = ? ;",
      [req.params.key1, req.params.key2])
    if(rows.length === 0){
      res.status(404).send()
      return
    }
    res.json(rows)
  }catch(err){
    console.log("err: " + err)
    res.status(500).send(err)
  }

  // 上記は、下記のオリジナルと等価(コールバックよりわかりやすい、、かな？)
  // mysqlPool.query(
  //   "select * from  USER_MASTER where COMPANY_CD = ? and LOGIN_ID = ? ;",
  //   [req.params.key1, req.params.key2],
  //   (err, rows) => {
  //     if (err) {
  //       console.log("err: " + err)
  //       res.status(500).send(err)
  //       return
  //     }
  //     if(rows.length ===0){
  //       res.status(404).send()
  //       return
  //     }
  //     res.json(rows)
  //   }
  // )
})

// delete
// status 204
// 空データを返す
app.delete("/users/:key1/:key2", async (req, res) => {
  console.log('delete')
  if (!mysqlPool) {
    mysqlPool = mysql.createPool(config)
    mysqlPool.query = util.promisify(mysqlPool.query)
  }

  try{
    await mysqlPool.query(
      "delete from  USER_MASTER where COMPANY_CD = ? and LOGIN_ID = ? ;",
      [req.params.key1, req.params.key2])
    res.status(204).send()
  }catch(err){
    console.log("err: " + err)
    res.status(500).send(err)
  }
})
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

// 以下、RESTサーバをつくる
// https://qiita.com/uenosy/items/ba9dbc70781bddc4a491

import userRouter  from './userRouter' 
import companyRouter  from './companyRouter' 

app.use('/users',userRouter)
app.use('/companies',companyRouter)



// Express起動(Firebase Functionで動かす場合はココより上をコピー。)
const server = app.listen(3000, function() {
  console.log("Node.js is listening to PORT:" + server.address().port)
})
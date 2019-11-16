import * as express from 'express'
import * as mysql from 'promise-mysql'
import config from './config'

const router = express.Router()

let mysqlPool = mysql.createPool(config)

router
  // findAll
  // status 200
  // 結果配列を返す
  .get('/', async (req, res) => {
    console.log('find all')
    let connection = await mysqlPool.getConnection()
    try {
      const rows = await connection.query('select * from COMPANY_MASTER')
      if (rows.length === 0) {
        res.status(404).send()
        return
      }
      res.json(rows)
    } catch (err) {
      console.log('err: ' + err)
      res.status(500).send(err)
    } finally {
      console.log('end')
      mysqlPool.releaseConnection(connection)
    }
  })

  // create
  // status 201
  // 作成したオブジェクトを返す
  .post('/', async (req, res) => {
    console.log('create')
    const user = req.body
    console.log(JSON.stringify(user))

    let connection = await mysqlPool.getConnection()
    await connection.beginTransaction()
    try {
      await connection.query('insert into COMPANY_MASTER set ?', user)
      const rows = await connection.query(
        'select * from  COMPANY_MASTER where COMPANY_CD = ? ;',
        [user.COMPANY_CD]
      )
      connection.commit()
      res.status(201).json(rows[0])
    } catch (err) {
      console.log('err: ' + err)
      connection.rollback()
      res.status(500).send(err)
    } finally {
      console.log('end')
      mysqlPool.releaseConnection(connection)
    }
  })

  // update
  // status 200
  // 作成したオブジェクトを返す
  .put('/', async (req, res) => {
    console.log('update')
    const user = req.body
    console.log(JSON.stringify(user))
    const companyCode = user.COMPANY_CD
    const userName = user.COMPANY_NAME
    let connection = await mysqlPool.getConnection()
    await connection.beginTransaction()
    try {
      const rows = await connection.query(
        'update COMPANY_MASTER set COMPANY_CD = ? ,COMPANY_NAME = ? where COMPANY_CD = ?',
        [companyCode, userName, companyCode]
      )
      connection.commit()
      res.status(200).json(rows[0])
      // res.status(204).send();
    } catch (err) {
      console.log('err: ' + err)
      connection.rollback()
      res.status(500).send(err)
    } finally {
      console.log('end')
      mysqlPool.releaseConnection(connection)
    }
  })

// PK検索
// status 200
// 検索したオブジェクト(配列)を返す
router.get('/:key1/', async (req, res) => {
  console.log('find by pk')
  let connection = await mysqlPool.getConnection()
  try {
    const rows = await connection.query(
      'select * from  COMPANY_MASTER where COMPANY_CD = ?',
      [req.params.key1]
    )
    if (rows.length === 0) {
      res.status(404).send()
      return
    }
    res.json(rows)
  } catch (err) {
    console.log('err: ' + err)
    res.status(500).send(err)
  } finally {
    console.log('end')
    mysqlPool.releaseConnection(connection)
  }
})

// delete
// status 204
// 空データを返す
router.delete('/:key1/', async (req, res) => {
  console.log('delete')
  let connection = await mysqlPool.getConnection()
  await connection.beginTransaction()
  try {
    await mysqlPool.query('delete from  COMPANY_MASTER where COMPANY_CD = ?', [
      req.params.key1
    ])
    connection.commit()
    res.status(204).send()
  } catch (err) {
    console.log('err: ' + err)
    connection.rollback()
    res.status(500).send(err)
  } finally {
    console.log('end')
    mysqlPool.releaseConnection(connection)
  }
})

export default router

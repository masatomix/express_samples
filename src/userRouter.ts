import * as express from "express";
import * as mysql from "promise-mysql";
import config from "./config";

const router = express.Router();

let mysqlPool = mysql.createPool(config);

router
  // findAll
  // status 200
  // 結果配列を返す
  .get("/", async (req, res) => {
    console.log("find all user start.");
    let connection = await mysqlPool.getConnection()
    try {
      const rows = await connection.query("select * from  USER_MASTER;");
      if (rows.length === 0) {
        res.status(404).send();
        return;
      }
      res.json(rows);
    } catch (err) {
      console.log("err: " + err);
      res.status(500).send(err);
    } finally {
      console.log("find all user end.");
      mysqlPool.releaseConnection(connection);
    }
  })

  // create
  // status 201
  // 作成したオブジェクトを返す
  .post("/", async (req, res) => {
    console.log("create user start.");
    const user = req.body;
    console.log(JSON.stringify(user));

    let connection = await mysqlPool.getConnection()
    await connection.beginTransaction()
    try {
      await connection.query("insert into USER_MASTER set ?", user);
      const rows = await connection.query(
        "select * from  USER_MASTER where COMPANY_CD = ? and LOGIN_ID = ? ;",
        [user.COMPANY_CD, user.LOGIN_ID]
      );
      connection.commit()
      res.status(201).json(rows[0]);
    } catch (err) {
      console.log("err: " + err);
      connection.rollback()
      res.status(500).send(err);
    } finally {
      console.log("create user end.");
      mysqlPool.releaseConnection(connection);
    }
  })

  // update
  // status 200
  // 作成したオブジェクトを返す
  .put("/", async (req, res) => {
    console.log("update user start.");
    const user = req.body;
    console.log(JSON.stringify(user));
    const companyCode = user.COMPANY_CD;
    const loginId = user.LOGIN_ID;
    const userName = user.USER_NAME;
    let connection = await mysqlPool.getConnection()
    await connection.beginTransaction()
    try {
      const rows = await connection.query(
        "update USER_MASTER set COMPANY_CD = ? ,LOGIN_ID = ? ,USER_NAME = ? where COMPANY_CD = ? and LOGIN_ID = ?",
        [companyCode, loginId, userName, companyCode, loginId]
      );
      connection.commit()
      res.status(200).json(rows[0]);
      // res.status(204).send();
    } catch (err) {
      console.log("err: " + err);
      connection.rollback()
      res.status(500).send(err);
    } finally {
      console.log("update user end.");
      mysqlPool.releaseConnection(connection);
    }
  });

// PK検索
// status 200
// 検索したオブジェクト(配列)を返す
router.get("/:company_cd/:login_id", async (req, res) => {
  console.log("find by pk start.");
    let connection = await mysqlPool.getConnection()
  try {
    const rows = await connection.query(
      "select * from  USER_MASTER where COMPANY_CD = ? and LOGIN_ID = ? ;",
      [req.params.company_cd, req.params.login_id]
    );
    if (rows.length === 0) {
      res.status(404).send();
      return;
    }
    res.json(rows);
  } catch (err) {
    console.log("err: " + err);
    res.status(500).send(err);
  } finally {
    console.log("find by pk end.");
    mysqlPool.releaseConnection(connection);
  }
});

// delete
// status 204
// 空データを返す
router.delete("/:company_cd/:login_id", async (req, res) => {
  console.log("delete user start.");
  let connection = await mysqlPool.getConnection()
  await connection.beginTransaction()
  try {
    await connection.query(
      "delete from  USER_MASTER where COMPANY_CD = ? and LOGIN_ID = ? ;",
      [req.params.company_cd, req.params.login_id]
    );
    connection.commit()
    res.status(204).send();
  } catch (err) {
    console.log("err: " + err);
    connection.rollback()
    res.status(500).send(err);
  } finally {
    console.log("delete user end.");
    mysqlPool.releaseConnection(connection);
  }
});

export default router;
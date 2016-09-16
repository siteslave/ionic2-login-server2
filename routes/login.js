var express = require('express');
var router = express.Router();

var crypto = require('crypto');
var Jwt = require('../models/jwt')

router.post('/', (req, res, next) => {
  let db = req.db;
  let username = req.body.username;
  let password = req.body.password;

  let encryptedPass = crypto.createHash('md5').update(password).digest('hex');
  let sql = `SELECT * FROM users WHERE username=? AND password=?`;

  db.raw(sql, [username, encryptedPass])
    .then((rows) => {
      console.log(rows[0])
      if (rows[0].length) {
        let params = { user_id: rows[0][0].id };
        let token = Jwt.sign(params);
        res.send({ ok: true, token: token });
      } else {
        res.send({ok: false, msg: 'ชื่อผู้ใช้งาน/รหัสผ่าน ไม่ถูกต้อง'})
      }
    })
    .catch(err => res.send({ok: false, msg: 'MySQL error!'}));
})

module.exports = router;

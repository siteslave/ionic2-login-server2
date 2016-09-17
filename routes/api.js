var express = require('express');
var router = express.Router();
var jwt = require('../models/jwt')

router.get('/list', function(req, res, next) {
  let db = req.db;
  let token = req.query.token;

  jwt.verify(token)
    .then((decoded) => {
        let sql = `SELECT HOSPCODE, PID, NAME, LNAME, SEX FROM tmp_dengue LIMIT 10`;
        db.raw(sql, [])
          .then(rows => {
            res.send({ ok: true, rows: rows[0] });
          })
          .catch(err => {
            res.send({ ok: false, msg: err.message })
          });
    }, err => {
      console.log(err);
      res.send({ok: false, msg: 'Invalid token!'})
    });

});

router.post('/search', function(req, res, next) {
  let db = req.db;
  let token = req.body.token;
  let query = req.body.query;

  jwt.verify(token)
    .then((decoded) => {
      let sql = `SELECT HOSPCODE, PID, NAME, LNAME, SEX
        FROM tmp_dengue
        WHERE NAME LIKE ?
        LIMIT 10`;
      let _query = `${query}%`
        db.raw(sql, [_query])
          .then(rows => {
            res.send({ ok: true, rows: rows[0] });
          })
          .catch(err => {
            res.send({ ok: false, msg: err.message })
          });
    }, err => {
      console.log(err);
      res.send({ok: false, msg: 'Invalid token!'})
    });

});

router.post('/date-filter', function(req, res, next) {
  let db = req.db;
  let token = req.body.token;
  let dateServ = req.body.dateServ;

  jwt.verify(token)
    .then((decoded) => {
      let sql = `SELECT HOSPCODE, PID, NAME, LNAME, SEX
        FROM tmp_dengue
        WHERE DATE_SERV=?
        LIMIT 10`;
      db.raw(sql, [dateServ])
        .then(rows => {
          res.send({ ok: true, rows: rows[0] });
        })
        .catch(err => {
          res.send({ ok: false, msg: err.message })
        });
    }, err => {
      console.log(err);
      res.send({ok: false, msg: 'Invalid token!'})
    });

});

router.post('/emr', function(req, res, next) {
  let db = req.db;
  let token = req.body.token;
  let hpid = req.body.hpid;

  jwt.verify(token)
    .then((decoded) => {
      let sql = `select d.DATE_SERV as date_serv, d.DIAGCODE as diagcode, t.diagtname, h.hoscode, h.hosname
        from tmp_dengue as d
        left join cicd10tm as t on t.diagcode=d.DIAGCODE
        left join chospital as h on h.hoscode=d.HOSPCODE
        where concat(d.HOSPCODE, d.PID)=?
        `;
      db.raw(sql, [hpid])
        .then(rows => {
          res.send({ ok: true, rows: rows[0] });
        })
        .catch(err => {
          res.send({ ok: false, msg: err.message })
        });
    }, err => {
      console.log(err);
      res.send({ok: false, msg: 'Invalid token!'})
    });

});

module.exports = router;

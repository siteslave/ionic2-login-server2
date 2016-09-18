var express = require('express');
var router = express.Router();
var jwt = require('../models/jwt')
var gcm = require('node-gcm')

router.get('/users-list', (req, res, next) => {
  let db = req.db;
  let sql = `SELECT username FROM users`;

  db.raw(sql, [])
    .then(rows => {
      res.send({ ok: true, rows: rows[0] })
    })
    .catch(err => {
      res.send({ ok: false, msg: err })
    });
})

router.post('/send-notify', (req, res, next) => {
  let db = req.db;
  let token = req.body.token;
  let username = req.body.username;

  let sql = `SELECT token FROM users WHERE username=?`;
  db.raw(sql, [username])
    .then(rows => {
      
      var message = new gcm.Message();

      message.addData('title', 'ทดสอบ')
      message.addData('message', 'สวัสดี')
      message.addData('content-available', true)

      let allTokens = [];
      rows[0].forEach(v => {
        if (v.token) allTokens.push(v.token);
      })

      console.log(allTokens)
      
      var tokens = allTokens

      var sender = new gcm.Sender('AIzaSyD6UdWkXR-VbYs0UU8uY6R8NzLszAqddd4')

      sender.send(message, { registrationTokens: tokens }, (err, response) => {
        console.log(response)
        if (err) res.send({ok: false, msg: err})
        else res.send({ok: true})
      });
        
    })
    .catch(err => {
      res.send({ ok: false })
    });


})

router.post('/register-device', (req, res, next) => {
  let deviceToken = req.body.deviceToken;
  let username = req.body.username;
  let token = req.body.token;

  let db = req.db;

  console.log(req.body);
  
    jwt.verify(token)
    .then((decoded) => {
        let sql = `UPDATE users SET token=? WHERE username=?`;
        db.raw(sql, [deviceToken, username])
          .then(() => {
            res.send({ ok: true });
          })
          .catch(err => {
            res.send({ ok: false, msg: err.message })
          });
    }, err => {
      console.log(err);
      res.send({ok: false, msg: 'Invalid token!'})
    });

})

router.get('/map', function(req, res, next) {
  let db = req.db;
  let token = req.query.token;

  jwt.verify(token)
    .then((decoded) => {
        let sql = `SELECT LATITUDE, LONGITUDE tmp_dengue LIMIT 10`;
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

router.get('/list', function(req, res, next) {
  let db = req.db;
  let token = req.query.token;

  jwt.verify(token)
    .then((decoded) => {
        let sql = `SELECT HOSPCODE, PID, NAME, LNAME, SEX, DATE_SERV FROM tmp_dengue LIMIT 10`;
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
      let sql = `SELECT HOSPCODE, PID, NAME, LNAME, SEX, DATE_SERV
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
      let sql = `SELECT HOSPCODE, PID, NAME, LNAME, SEX, DATE_SERV
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

router.post('/emr-detail', function(req, res, next) {
  let db = req.db;
  let token = req.body.token;
  let hpid = req.body.hpid;
  let dateServ = req.body.dateServ;

  jwt.verify(token)
    .then((decoded) => {
      let sql = `select d.DATE_SERV as date_serv, d.DIAGCODE as diagcode, t.diagtname, h.hoscode, h.hosname,
      d.VILLAGENAME as village, d.TAMBONNAME as tambon, d.AMPURNAME as ampur
      from tmp_dengue as d
      left join cicd10tm as t on t.diagcode=d.DIAGCODE
      left join chospital as h on h.hoscode=d.HOSPCODE
      where concat(d.HOSPCODE, d.PID)=? and d.DATE_SERV=?
      limit 1
        `;
      db.raw(sql, [hpid, dateServ])
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

router.post('/top-icd', function(req, res, next) {
  let db = req.db;
  let token = req.body.token;

  jwt.verify(token)
    .then((decoded) => {
      let sql = `
      select d.DIAGCODE as diagcode, c.diagtname, count(distinct d.HOSPCODE, d.PID) as total
      from tmp_dengue as d
      left join cicd10tm as c on c.diagcode=d.DIAGCODE
      group by d.DIAGCODE
      order by total desc
      limit 10
        `;
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

router.post('/top-hospital', function(req, res, next) {
  let db = req.db;
  let token = req.body.token;

  jwt.verify(token)
    .then((decoded) => {
      let sql = `
        select h.hosname, count(distinct d.HOSPCODE, d.PID) as total
        from tmp_dengue as d
        left join chospital as h on h.hoscode=d.HOSPCODE
        group by d.HOSPCODE
        order by total desc

        limit 10
        `;
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

module.exports = router;

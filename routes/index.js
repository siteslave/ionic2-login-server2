'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({ok: true, msg: 'Hello'})
});

// http://localhost:3000/all
router.get('/fruits/all', (req, res, next) => { 
  let fruits = ['Apple', 'Orange', 'Banana'];
  res.send({ok: true, fruits: fruits})
})


router.get('/download', (req, res, next) => {
  let file = './files/report.pdf'
  res.download(file)
})

router.get('/products', (req, res, next) => {
  let db = req.db;
  let sql = `
  select p.name, p.id, c.name as category_name from products as p
  left join categories as c on c.id=p.category_id
  where p.id=? and c.id=?
  `;

  db.raw(sql, [2, 1])
    .then(rows => {
      res.send({ ok: true, rows: rows[0] })
    })
    .catch(err => {
      console.log(err)
      res.send({ ok: false, msg: `[${err.code}] ${err.message}` })
    });
})

// localhost:3000/products
router.post('/products', (req, res, next) => {
  let db = req.db;
  let name = req.body.name;
  let category_id = req.body.category_id;

  let sql = `
  INSERT INTO products(name, category_id) 
  VALUES(?, ?)
  `;

  db.raw(sql, [name, category_id])
    .then(() => {
      res.send({ok: true})
    })
    .catch((err) => {
      res.send({ok: false, msg: err.message})
    });

})

router.put('/products', (req, res, next) => {
  let db = req.db;
  let name = req.body.name;
  let category_id = req.body.category_id;
  let id = req.body.id;

  let sql = `
  UPDATE products SET name=?, category_id=?
  WHERE id=?
  `;

  db.raw(sql, [name, category_id, id])
    .then(() => {
      res.send({ok: true})
    })
    .catch((err) => {
      res.send({ok: false, msg: err.message})
    });

})

// localhost:3000/5
router.delete('/products/:id', (req, res, next) => {
  let db = req.db;
  let id = req.params.id;

  let sql = `DELETE FROM products WHERE id=?`;

  db.raw(sql, [id])
    .then(() => {
      res.send({ok: true})
    })
    .catch((err) => {
      res.send({ok: false, msg: err.message})
    });
})

module.exports = router;

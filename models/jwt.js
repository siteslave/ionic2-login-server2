'use strict'
var secretKey = '123456789qwe@#$$%$%^rtyuighfh';
var jwt = require('jsonwebtoken');
var Q = require('q');
module.exports = {

  sign(params) {
    return jwt.sign(params, secretKey, {
      expiresIn: "2 days"
    })
  },

  verify(token) {
    let q = Q.defer();
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) q.reject(err)
      else q.resolve(decoded)
    });

    return q.promise;
  }
}
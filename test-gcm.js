'use strict';

var gcm = require('node-gcm')

var message = new gcm.Message();

message.addData('title', 'ทดสอบ')
message.addData('message', 'สวัสดี')
message.addData('content-available', true)

var tokens = ["eh-fEaZd1N8:APA91bGkWhCEqFtYVtHymY9jjypG1qVmYrSLsowxU2EFA7TtsxGCml8ZEqicBrg_yrLjEq6GhhrnMQ_caIaWWGy7rqP_aeftS3aw3twX1v0TfsUgRVURXr18ZsHodDNI_RKHqGjleQQM"]

var sender = new gcm.Sender('AIzaSyD6UdWkXR-VbYs0UU8uY6R8NzLszAqddd4')

sender.send(message, { registrationTokens: tokens }, (err, response) => {
  if (err) console.log(err)
  else console.log(response)
});
var mongoose = require('mongoose');
//mongoose.set('debug', true);
var Schema = mongoose.Schema;
 
// Thanks to http://blog.matoski.com/articles/jwt-express-node-mongoose/
 
// set up a mongoose model
var ContactSchema = new Schema({
  firstName: {
        type: String,
        unique: true,
        required: true
    },
  lastName: {
        type: String,
        unique: true,
        required: true
    },
  email: {
        type: String,
        required: true
    }
});
 
module.exports = mongoose.model('Contact', ContactSchema);

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./routes/route');
const multer = require('multer');
const app = express();
app.use(multer().any());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://umed007-sable:4Q9gJnzBwxbCeaJP@cluster0.wunsw.mongodb.net/Group28Database1?authSource=admin&replicaSet=atlas-63xe24-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
import webInquiryAdapter from "./../../app/src/webInquiryAdapter"
import * as express from "express"
import * as bodyParser from "body-parser"
import * as path from "path"

const port = 8200;
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// function sendFile(res, p) {
//   res.sendFile(path.join(__dirname + "/" + p));
// }

// app.use('/dist', express.static('dist'))
// app.use('/res', express.static('res'))

// app.get('/', (req, res) => {
//   sendFile(res, "index.html")
// });



// app.post("/rec", (req, res) => {
//   setTimeout(() => {
//     res.send('{"valid": true, "data": {"fullName": "Maximilian Mairinger", "class": "lehrer", "registered": [true, false, true, true]}}')
//   }, 2000)
// })


app.listen(port);
console.log("Listening on Port: " + port);


let inq = webInquiryAdapter("localhost")

app.post("/inq", inq)




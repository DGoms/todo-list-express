const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Error = require('./utils/error');
const PORT = process.env.PORT || 8080

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.all('/', function (req, res) {
    res.redirect('/todos');
})

app.use(require('./controller/todo').prefixUrl, require('./controller/todo'))

app.use((req, res, next) => {
    throw new Error.NotFoundError()
})

app.use((error, req, res, next) => {
    if (!(error instanceof Error.HttpError)) {
        console.error(error)
        error = new Error.ServerError()
    }

    return res.status(error.status || 500).json({ error })
})

app.listen(PORT, () => {
    console.log('Serveur sur port :', PORT);
    console.log('http://localhost:' + PORT + '/');
})
const Sequelize = require('sequelize')
const db = require('../utils/db')

const Todo = db.define('todo',
    {
        message: Sequelize.STRING,
        completion: Sequelize.STRING
    })
module.exports = Todo
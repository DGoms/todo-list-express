import { Request, Response, NextFunction } from "express";
import { Todo } from "../models/Todo";
import { BadRequestError, NotFoundError, ServerError } from "../utils/Error";

export class TodoController {
    public static readonly baseUrl = '/todos';

    constructor() {

    }

    public async index(req: Request, res: Response, next: NextFunction) {
        let limit = +req.query.limit || 25;
        let offset = +req.query.offset || 0;
        let completion = req.query.completion;

        let where;
        if (completion)
            where = { completion }


        let todos = await Todo.findAll({
            limit,
            offset,
            where
        });

        res.format({
            html: () => { res.send('todo') },
            json: () => { res.send({ todos }) }
        })
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        let message = req.body.message;
        let completion = req.body.completion;

        if (!message || !completion) return next(new BadRequestError(`missing parameters 'message' or 'completion'`));

        let todo = await Todo.create({
            message: message,
            completion: completion
        })

        res.redirect('/todos/' + todo.id);
    }

    public async parseId(req: Request, res: Response, next: NextFunction) {
        let id = +req.params.todoId
        if (id != req.params.todoId) return next(new BadRequestError('Id should be a number'))

        let todo = await Todo.findById(id);
        if (!todo) return next(new NotFoundError())

        res.locals.todo = todo;
        next();
    }

    public async show(req: Request, res: Response, next: NextFunction) {
        let todo = res.locals.todo;

        res.format({
            html: () => { res.send('todo') },
            json: () => { res.send({ todo }) }
        })
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        let todo = res.locals.todo;

        let message = req.body.message || todo.message;
        let completion = req.body.completion || todo.completion;

        let resBd = await Todo.update(
            { message, completion },
            { where: { id: todo.id } }
        )

        res.redirect('/todos/' + todo.id);
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        let nb = await Todo.destroy({
            where: {
                id: res.locals.todo.id
            }
        });

        if (nb < 1) return next(new ServerError());

        res.format({
            html: () => { res.send('todo') },
            json: () => { res.status(204); res.end() }
        })
    }
}


// const express = require('express')
// const app = express.Router();
// const Error = require('../utils/error');
// const Todo = require('../models/todo');

// const prefixUrl = "/todos";

// app
//     /**
//      * Show list of todos
//      */
//     .get('/', async (req, res, next) => {
//         let limit = +req.query.limit || 25;
//         let offset = +req.query.offset || 0;
//         let completion = req.query.completion;

//         let where; 
//         if(completion)
//             where = {completion}


//         let todos = await Todo.findAll({ 
//             limit, 
//             offset,
//             where
//         });

//         res.format({
//             html: () => { res.send('todo') },
//             json: () => { res.send({ todos }) }
//         })
//     })

//     /**
//      * Create todo and return the todo created
//      */
//     .post('/', async (req, res, next) => {
//         let message = req.body.message;
//         let completion = req.body.completion;

//         if (!message || !completion) return next(new Error.BadRequestError(`missing parameters 'message' or 'completion'`));

//         let todo = await Todo.create({
//             message: message,
//             completion: completion
//         })

//         res.redirect('/todos/'+ todo.id);
//     })


//     .all('/:todoId', async (req, res, next) => {
//         let id = +req.params.todoId
//         if (id != req.params.todoId) return next(new Error.BadRequestError('Id should be a number'))

//         let todo = await Todo.findById(id);
//         if (!todo) return next(new Error.NotFoundError())

//         res.locals.todo = todo;
//         next();
//     })

//     /**
//      * Show the todo with this id
//      */
//     .get('/:todoId', async (req, res, next) => {
//         let todo = res.locals.todo;

//         res.format({
//             html: () => { res.send('todo') },
//             json: () => { res.send({ todo }) }
//         })
//     })

//     .patch('/:todoId', async (req, res, next) => {
//         let todo = res.locals.todo;

//         let message = req.body.message || todo.message;
//         let completion = req.body.completion || todo.completion;

//         let resBd = await Todo.update(
//             { message, completion },
//             { where: { id: todo.id } }
//         )

//         res.redirect('/todos/'+ todo.id);
//     })

//     .delete('/:todoId', async (req, res, next) => {
//         let nb = await Todo.destroy({
//             where: {
//                 id: res.locals.todo.id
//             }
//         });

//         if (nb < 1) return next(new Error.ServerError());

//         res.format({
//             html: () => { res.send('todo') },
//             json: () => { res.status(204); res.end() }
//         })
//     })

// module.exports = app;
// module.exports.prefixUrl = prefixUrl;
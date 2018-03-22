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


        let todos = await Todo.findAll({limit,offset,where}).catch(next);

        res.format({
            html: () => { res.send('todo') },
            json: () => { res.send({ todos }) }
        })
    }

    public async add(req: Request, res: Response, next: NextFunction){

    }

    public async create(req: Request, res: Response, next: NextFunction) {
        let message = req.body.message;
        let completion = req.body.completion;

        if (!message || !completion) return next(new BadRequestError(`missing parameters 'message' or 'completion'`));

        let todo = new Todo({ message, completion});

        await todo.save().catch(next);
        
        res.redirect('/todos/' + todo.id);
    }

    public async parseId(req: Request, res: Response, next: NextFunction) {
        let id = +req.params.todoId
        if (id != req.params.todoId) return next(new BadRequestError('Id should be a number'))

        let todo = await Todo.findById(id).catch(next);
        if (!todo) return next(new NotFoundError())

        res.locals.todo = todo;
        next();
    }

    public show(req: Request, res: Response, next: NextFunction) {
        let todo = res.locals.todo;

        res.format({
            html: () => { res.send('todo') },
            json: () => { res.send({ todo }) }
        })
    }

    public async edit(req: Request, res: Response, next: NextFunction) {

    }

    public async update(req: Request, res: Response, next: NextFunction) {
        let todo = res.locals.todo;

        if(req.body.message)
            todo.message = req.body.message;
        
        if(req.body.completion)
            todo.completion = req.body.completion;

        await todo.save().catch(next);

        res.redirect('/todos/' + todo.id);
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        let todo = res.locals.todo;
        todo.delete().catch(next);

        res.format({
            html: () => { res.send('todo') },
            json: () => { res.status(204); res.end() }
        })
    }
}
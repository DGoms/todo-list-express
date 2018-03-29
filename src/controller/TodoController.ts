import { Request, Response, NextFunction, Router } from "express";
import { Todo } from "../models/Todo";
import { BadRequestError, NotFoundError, ServerError, MyRequest } from "../utils";
import { BaseController, IRoute, HttpMethod } from ".";

export class TodoController extends BaseController {

    protected static baseUrl: string = "/todos";

    protected static routes: IRoute[] = [
        { httpMethod: HttpMethod.GET, path: '/', action: 'index' },
        { httpMethod: HttpMethod.GET, path: '/add', action: 'add' },
        { httpMethod: HttpMethod.POST, path: '/', action: 'create' },
        { httpMethod: HttpMethod.GET, path: '/:todo', action: 'show' },
        { httpMethod: HttpMethod.GET, path: '/:todo/edit', action: 'edit' },
        { httpMethod: HttpMethod.PATCH, path: '/:todo', action: 'update' },
        { httpMethod: HttpMethod.GET, path: '/:todo/delete', action: 'delete' },
        { httpMethod: HttpMethod.DELETE, path: '/:todo', action: 'delete' }
    ];

    public async index(req: Request, res: Response, next: NextFunction) {
        let limit = +req.query.limit || 25;
        let offset = +req.query.offset || 0;
        let completion = req.query.completion;

        let where;
        if (completion)
            where = { completion }


        let todos = await Todo.findAll({ limit, offset, where }).catch(next);

        res.format({
            html: () => { res.render('todo/list', { todos, alert: res.locals.alert }) },
            json: () => { res.send({ todos }) }
        })
    }

    public async add(req: Request, res: Response, next: NextFunction) {
        res.render('todo/form', {
            title: "Add todo",
            action: TodoController.baseUrl
        });
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        let message = req.body.message;
        let completion = req.body.completion;

        if (!message || !completion) return next(new BadRequestError(`missing parameters 'message' or 'completion'`));

        let todo = new Todo({ message, completion });

        await todo.save().catch(next);

        res.redirect('/todos/' + todo.id);
    }

    public show(req: MyRequest, res: Response, next: NextFunction) {
        let todo = req.todo;

        res.format({
            html: () => { res.render('todo/show', { todo }) },
            json: () => { res.send({ todo }) }
        })
    }

    public async edit(req: MyRequest, res: Response, next: NextFunction) {
        let todo = req.todo
        res.render('todo/form', {
            title: "Edit todo",
            todo,
            action: TodoController.baseUrl,
            method: HttpMethod.PATCH
        });
    }

    public async update(req: MyRequest, res: Response, next: NextFunction) {
        let todo = req.todo;

        if (req.body.message)
            todo.message = req.body.message;

        if (req.body.completion)
            todo.completion = req.body.completion;

        await todo.save().catch(next);

        res.redirect('/todos/' + todo.id);
    }

    public async delete(req: MyRequest, res: Response, next: NextFunction) {
        let todo: Todo = req.todo;
        await todo.destroy().catch(next);
        res.locals.alert = { status: "success", message: "Todo item deleted !" };

        res.format({
            html: () => { this.index(req, res, next) },
            json: () => { res.status(204); res.end() }
        })
    }
}
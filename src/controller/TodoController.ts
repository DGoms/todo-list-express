import { Request, Response, NextFunction, Router } from "express";
import { Todo } from "../models/Todo";
import { BadRequestError, NotFoundError, ServerError } from "../utils/Error";
import { BaseController, IRoute, HttpMethod } from ".";

export class TodoController extends BaseController {
    protected readonly baseUrl: string = "/todos";

    protected readonly routes: IRoute[] = [
        { httpMethod: HttpMethod.GET, path:'/', action: this.index},
        { httpMethod: HttpMethod.GET, path:'/add', action: this.add},
        { httpMethod: HttpMethod.POST, path:'/', action: this.create},
        { httpMethod: HttpMethod.GET, path:'/:todo', action: this.show},
        { httpMethod: HttpMethod.GET, path:'/:todo/edit', action: this.edit},
        { httpMethod: HttpMethod.PATCH, path:'/:todo', action: this.update},
        { httpMethod: HttpMethod.GET, path:'/:todo/delete', action: this.delete},
        { httpMethod: HttpMethod.DELETE, path:'/:todo', action: this.delete}
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
            html: () => { res.render('todo/index', { todos, alert: res.locals.alert }) },
            json: () => { res.send({ todos }) }
        })
    }

    public async add(req: Request, res: Response, next: NextFunction) {
        res.render('todo/form', {
            title: "Add todo",
            action: this.baseUrl,
            method: "POST"
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

    // public async parseId(req: Request, res: Response, next: NextFunction) {
    //     let id = +req.params[0]
    //     if (id != req.params[0]) return next(new BadRequestError('Id should be a number'))

    //     let todo = await Todo.findById(id).catch(next);
    //     if (!todo) return next(new NotFoundError())

    //     res.locals.todo = todo;
    //     next();
    // }

    public show(req: Request, res: Response, next: NextFunction) {
        let todo = req.todo;

        res.format({
            html: () => { res.render('todo/show', { todo }) },
            json: () => { res.send({ todo }) }
        })
    }

    public async edit(req: Request, res: Response, next: NextFunction) {
        if (req.body.message || req.body.completion)
            await this.update(req, res, next);
        else {
            let todo = res.locals.todo
            res.render('todo/form', {
                title: "Edit todo",
                todo, 
                action: this.baseUrl + "/" + todo.id + "/edit",
                method: "POST"
            });
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        let todo = res.locals.todo;

        if (req.body.message)
            todo.message = req.body.message;

        if (req.body.completion)
            todo.completion = req.body.completion;

        await todo.save().catch(next);

        res.redirect('/todos/' + todo.id);
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        let todo: Todo = res.locals.todo;
        await todo.destroy().catch(next);
        res.locals.alert = {status: "success", message: "Todo item deleted !"};

        res.format({
            html: () => { this.index(req, res, next) },
            json: () => { res.status(204); res.end() }
        })
    }
}
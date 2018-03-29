import { Todo } from "../models/Todo";
import { BadRequestError } from "../utils";
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

    public async index() {
        let limit = +this.req.query.limit || 25;
        let offset = +this.req.query.offset || 0;
        let completion = this.req.query.completion;

        let where:any = {};
        where['userId'] = this.user.id;
        if (completion)
            where['completion'] = completion;


        let todos = await Todo.findAll({ limit, offset, where }).catch(this.next);

        this.res.format({
            html: () => { this.render('todo/list', { todos, alert: this.res.locals.alert }) },
            json: () => { this.res.send({ todos }) }
        })
    }

    public async add() {
        this.render('todo/form', {
            title: "Add todo",
            action: TodoController.baseUrl
        });
    }

    public async create() {
        try{
            let message = this.req.body.message;
            let completion = this.req.body.completion;

            if (!message || !completion) throw new BadRequestError(`missing parameters 'message' or 'completion'`);

            let todo = await new Todo({ message, completion, userId: this.user.id }).save();

            this.res.redirect('/todos/' + todo.id);
        }catch(err){
            this.next(err);
        }
        
    }

    public show() {
        let todo = this.req.todo;

        this.res.format({
            html: () => { this.render('todo/show', { todo }) },
            json: () => { this.res.send({ todo }) }
        })
    }

    public async edit() {
        let todo = this.req.todo
        this.render('todo/form', {
            title: "Edit todo",
            todo,
            action: TodoController.baseUrl,
            method: HttpMethod.PATCH
        });
    }

    public async update() {
        let todo = this.req.todo;

        if (this.req.body.message)
            todo.message = this.req.body.message;

        if (this.req.body.completion)
            todo.completion = this.req.body.completion;

        await todo.save().catch(this.next);

        this.res.redirect('/todos/' + todo.id);
    }

    public async delete() {
        let todo: Todo = this.req.todo;
        await todo.destroy().catch(this.next);
        this.res.locals.alert = { status: "success", message: "Todo item deleted !" };

        this.res.format({
            html: () => { this.index() },
            json: () => { this.res.status(204); this.res.end() }
        })
    }
}
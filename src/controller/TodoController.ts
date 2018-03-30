import * as Path from 'path';
import { Todo } from "../models/Todo";
import { BadRequestError, TodoStatus, TodoStatusUtil, ValidationErrorUtils } from "../utils";
import { BaseController, IRoute, HttpMethod } from ".";
import { ValidationError, ValidationErrorItem } from 'sequelize';

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
        // let page = +this.req.query.page || 1;
        let completion = this.req.query.completion;

        let where:any = {};
        where['userId'] = (await this.getUser()).id;
        if (completion)
            where['completion'] = completion;


        let todos = await Todo.findAll({ limit, offset, where }).catch(this.next);

        this.res.format({
            html: () => { this.render('todo/list', { todos, alert: this.res.locals.alert }) },
            json: () => { this.res.send({ todos }) }
        })
    }

    public async add(validError?: ValidationError) {
        let errors = validError ? validError.errors : undefined;

        this.render('todo/form', {
            title: "Add todo",
            action: TodoController.baseUrl,
            statusOptions: TodoStatus,
            errors
        });
    }

    public async create() {
        let message: string = this.req.body.message;
        let completion: TodoStatus = TodoStatusUtil.toEnum(this.req.body.completion);

        let todoOrValidError = await new Todo({ 
            message, 
            completion, 
            userId: (await this.getUser()).id 
        }).save().catch((err) => {return err});


        if(todoOrValidError instanceof Todo){
            this.res.format({
                html: () => { this.res.redirect(TodoController.pathJoin(todoOrValidError.id.toString())); },
                json: () => { this.res.send({todo: todoOrValidError}); }
            });
        }else{
            let validError: ValidationError = todoOrValidError;
            this.res.format({
                html: () => { 
                    if(this.isBodyEmpty()) validError.errors = undefined;
                    this.add(validError)
                },
                json: () => { this.next(new BadRequestError(ValidationErrorUtils.itemToString(validError.errors))) }
            });    
        }
    }

    public show() {
        let todo = this.req.todo;

        this.res.format({
            html: () => { this.render('todo/show', { todo }) },
            json: () => { this.res.send({ todo }) }
        })
    }

    public async edit(validError?: ValidationError) {
        let errors = validError ? validError.errors : undefined;
        let todo = this.req.todo;

        this.render('todo/form', {
            title: "Edit todo",
            action: TodoController.pathJoin(todo.id.toString()),
            statusOptions: TodoStatus,
            todo,
            method: HttpMethod.PATCH,
            errors
        });
    }

    public async update() {
        let todo = this.req.todo;
        let message: string = this.req.body.message;
        let completion: TodoStatus = TodoStatusUtil.toEnum(this.req.body.completion) || TodoStatus.TODO;

        todo.message = message;
        todo.completion = completion;

        let todoOrValidError = await todo.save().catch((err)=>{return err});

        if(todoOrValidError instanceof Todo){
            this.res.format({
                html: () => { this.res.redirect(TodoController.pathJoin(todoOrValidError.id.toString())); },
                json: () => { this.res.send({todo: todoOrValidError}); }
            });
        }else{
            let validError: ValidationError = todoOrValidError;
            this.res.format({
                html: () => { 
                    if(this.isBodyEmpty()) validError.errors = undefined;
                    this.edit(validError)
                },
                json: () => { this.next(new BadRequestError(ValidationErrorUtils.itemToString(validError.errors))) }
            });    
        }
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
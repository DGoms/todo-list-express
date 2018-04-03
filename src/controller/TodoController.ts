import * as Path from 'path';
import { Todo } from "../models/Todo";
import { BadRequestError, TodoStatus, TodoStatusUtil, ValidationErrorUtils, UnauthorizedError } from "../utils";
import { BaseController, IRoute, HttpMethod } from ".";
import { ValidationError, ValidationErrorItem } from 'sequelize';
import { Team, User } from '../models';

export class TodoController extends BaseController {

    protected static baseUrl: string = "/todos";

    protected static routes: IRoute[] = [
        { httpMethod: HttpMethod.GET, path: '/', action: 'listOfTeam' },
        { httpMethod: HttpMethod.GET, path: '/me', action: 'listOfUser' },
        { httpMethod: HttpMethod.GET, path: '/add', action: 'add' },
        { httpMethod: HttpMethod.POST, path: '/', action: 'create' },
        { httpMethod: HttpMethod.ALL, path: '/:todo', action: 'checkAuthorized' },
        { httpMethod: HttpMethod.GET, path: '/:todo', action: 'show' },
        { httpMethod: HttpMethod.GET, path: '/:todo/edit', action: 'edit' },
        { httpMethod: HttpMethod.ALL, path: '/:todo/check', action: 'checkTodo' },
        { httpMethod: HttpMethod.PATCH, path: '/:todo', action: 'update' },
        { httpMethod: HttpMethod.DELETE, path: '/:todo', action: 'delete' }
    ];

    public async listOfTeam() {
        let user = await this.getUser();
        if(!user.teamId){
            this.listOfUser();
        }else{
            let limit = +this.req.query.limit || 25;
            let offset = +this.req.query.offset || 0;
            // let page = +this.req.query.page || 1;
            let completion = this.req.query.completion;

            let where:any = {};
            if (completion)
                where['completion'] = completion;

            let include = [
                {model: User, include: [{model: Team, where: { id: user.teamId }}]}
            ];

            let todos = await Todo.findAll({ limit, offset, where, include }).catch(this.next);

            this.res.format({
                html: () => { this.render('todo/list', { todos, alert: this.res.locals.alert }) },
                json: () => { this.res.send({ todos }) }
            })
        }
    }

    public async listOfUser() {
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

    public async add() {
        this.render('todo/form', {
            title: "Add todo",
            action: TodoController.baseUrl,
            statusOptions: TodoStatus,
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
                html: async () => { 
                    if(this.isBodyEmpty()) validError.errors = undefined;
                    this.req.session.alert = {errors: ValidationErrorUtils.itemToStringArray(validError.errors)};
                    await this.saveSession();
                    this.res.redirect(TodoController.pathJoin('add'));                    
                },
                json: () => { this.next(new BadRequestError(ValidationErrorUtils.itemToString(validError.errors))) }
            });    
        }
    }

    public async show() {
        let todo = this.req.data.todo;
            
        this.res.format({
            html: () => { this.render('todo/show', { todo }) },
            json: () => { this.res.send({ todo }) }
        })
    }

    public async edit() {
        let todo = this.req.data.todo;

        this.render('todo/form', {
            title: "Edit todo",
            action: TodoController.pathJoin(todo.id.toString()),
            statusOptions: TodoStatus,
            todo,
            method: HttpMethod.PATCH,
        });
    }

    public async update() {
        let todo = this.req.data.todo;
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
                html: async () => { 
                    if(this.isBodyEmpty()) validError.errors = undefined;
                    this.req.session.alert = {errors: ValidationErrorUtils.itemToStringArray(validError.errors)};
                    await this.saveSession();
                    this.res.redirect(TodoController.pathJoin(todo.id.toString(), 'edit'));
                },
                json: () => { this.next(new BadRequestError(ValidationErrorUtils.itemToString(validError.errors))) }
            });    
        }
    }

    public async checkTodo(){
        let todo: Todo = this.req.data.todo;
        let completion = TodoStatusUtil.toEnum(todo.completion);

        if(completion == TodoStatus.DONE){
            todo.completion = TodoStatus.TODO;
        }else{
            todo.completion = TodoStatus.DONE;
        }
        
        await todo.save();
        this.res.redirect('/');
    }

    public async delete() {
        let todo: Todo = this.req.data.todo;
        await todo.destroy().catch(this.next);

        this.req.session.alert = {successes: [] = ["Todo item deleted !"]};
        await this.saveSession();

        this.res.format({
            html: () => { this.res.redirect(TodoController.pathJoin()); },
            json: () => { this.res.status(204); this.res.end() }
        })
    }

    public async checkAuthorized(){
        let user = await this.getUser();
        let todo = this.req.data.todo;

        if(todo.user.teamId != user.teamId && todo.userId != user.id){
            this.next(new UnauthorizedError());
        }
        else{
            this.next();
        }
    }
}
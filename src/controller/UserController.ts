import { BaseController, IRoute, HttpMethod } from ".";
import { BadRequestError } from "../utils";
import * as bcrypt from 'bcrypt';
import { User } from "../models";
import { ValidationError, ValidationErrorItem } from "sequelize";
/**
 * 
 * 
 * @export
 * @class UserController
 * @extends {BaseController}
 */
export class UserController extends BaseController{

    protected static baseUrl: string = '/users';
    protected static routes: IRoute[] = [
        {httpMethod: HttpMethod.ALL, path: '/login', action: 'login', root: true},
        {httpMethod: HttpMethod.ALL, path: '/register', action: 'register', root: true},
        {httpMethod: HttpMethod.ALL, path: '/logout', action: 'logout', root: true},
    ]

    public async login(){
        let errors: any[] = [];

        if(this.req.body.username && this.req.body.password){
            let user = await User.findOne({where: {username: this.req.body.username}}).catch(this.next);
            if(user){
                if(bcrypt.compareSync(this.req.body.password, user.password)){
                    this.user = user;
                    this.res.redirect('/');
                    return;
                }
                else{
                    errors.push({message: "Wrong username or password"});
                }
            }
            else{
                errors.push({message: "Wrong username or password"});
            }
        }

        this.res.format({
            html: () => { this.render('user/form', {submit:"Login", errors}) },
            json: () => { this.res.status(204); this.res.end() }
        })
    }

    public async register(){
        let user = new User();
        let errors: ValidationErrorItem[];
        let sent = false;

        try{
            if(this.req.body.username && this.req.body.password){
                user = new User(this.req.body);
                let userSave = await user.save();

                this.user = user;
                sent = true;

                this.res.format({
                    html: () => { this.res.redirect('/'); },
                    json: () => { this.res.status(204); this.res.end(); }
                });
            }
        }
        catch(err){
            if(err instanceof ValidationError){
                let _err = <ValidationError> err;
                errors = _err.errors;
                user.password = undefined;
            }
            else{
                this.next(err);
            }
        }
        finally{
            if(!sent)
                this.res.format({
                    html: () => { this.render('user/register', {submit:"Register", user, errors}) },
                    json: () => { this.next(new BadRequestError(`missing parameters 'username' or 'password'`)) }
                });
        }
    }

    public logout(){
        this.user = undefined;
        this.res.redirect('/');
    }
}
import { BaseController, IRoute, HttpMethod } from ".";
import { BadRequestError, ValidationErrorUtils } from "../utils";
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
export class UserController extends BaseController {

    protected static baseUrl: string = '/users';
    protected static routes: IRoute[] = [
        { httpMethod: HttpMethod.ALL, path: '/login', action: 'login', root: true },
        { httpMethod: HttpMethod.ALL, path: '/register', action: 'register', root: true },
        { httpMethod: HttpMethod.ALL, path: '/logout', action: 'logout', root: true },
        { httpMethod: HttpMethod.GET, path: '/me', action: 'showMe' },
    ]

    public async login() {
        let error: string = "Wrong username or password";

        if (this.req.body.username && this.req.body.password) {
            if(await this.checkAndSetUser(this.req.body.username, this.req.body.password)){
                this.res.redirect('/');
                return;
            }
        }

        this.res.format({
            html: () => { 
                if(!this.isBodyEmpty()) this.req.session.alert.errors = [error];
                this.render('user/form', { submit: "Login" }) 
            },
            json: () => { this.next(new BadRequestError(error)) }
        })
    }

    public async register() {
        let user: User = new User(this.req.body);
        // let validError: ValidationError = await user.validate().catch((err) => {return err});//FIX: pb avec validate qui fait un save, wtf ? O_o
        let userOrValidError: ValidationError|User = await user.save().catch((err) => {return err});

        if(userOrValidError instanceof User){
            this.setUser(userOrValidError);

            this.res.format({
                html: () => { this.res.redirect('/'); },
                json: () => { this.res.send({user: userOrValidError}); }
            });
        }else{
            let validError: ValidationError = userOrValidError;
            this.res.format({
                html: () => { 
                    if(!this.isBodyEmpty()) this.req.session.alert.errors = ValidationErrorUtils.itemToStringArray(validError.errors);
                    this.render('user/form', { submit: "Register", user }) 
                },
                json: () => { this.next(new BadRequestError(ValidationErrorUtils.itemToString(validError.errors))) }
            });    
        }
    }

    public logout() {
        this.setUser();
        this.res.redirect('/');
    }

    public showMe(){
        this.res.format({
            json: async () => {this.res.send(await this.getUser())}
        });
    }
}
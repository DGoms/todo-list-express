import { BaseController, IRoute, HttpMethod } from ".";
import { MyRequest, BadRequestError } from "../utils";
import { Response, NextFunction } from "express";
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
    ]

    public async login(req: MyRequest, res: Response, next: NextFunction){
        let errors: any[] = [];

        if(req.body.username && req.body.password){
            let user = await User.findOne({where: {username: req.body.username}}).catch(next);
            if(user){
                if(bcrypt.compareSync(req.body.password, user.password)){
                    this.setSessionUser(req, next, user);
                }
                else{
                    errors.push({message: "Wrong username or password"});
                }
            }
            else{
                errors.push({message: "Wrong username or password"});
            }
        }

        res.format({
            html: () => { res.render('user/form', {submit:"Login", errors}) },
            json: () => { res.status(204); res.end() }
        })
    }

    public async register(req: MyRequest, res: Response, next: NextFunction){
        let user = new User();
        let errors: ValidationErrorItem[];
        let sent = false;

        try{
            if(req.body.username && req.body.password){
                user = new User(req.body);
                let userSave = await user.save();

                this.setSessionUser(req, next, user);
                sent = true;

                res.format({
                    html: () => { res.redirect('/'); },
                    json: () => { res.status(204); res.end(); }
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
                next(err);
            }
        }
        finally{
            if(!sent)
                res.format({
                    html: () => { res.render('user/register', {submit:"Register", user, errors}) },
                    json: () => { next(new BadRequestError(`missing parameters 'username' or 'password'`)) }
                });
        }
    }

    private setSessionUser(req: MyRequest, next: NextFunction, user: User): void{
        req.session.user = user;
        req.session.save((err) => {
            if(err)
                next(err);
        });
    }
}
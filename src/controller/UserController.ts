import { BaseController, IRoute, HttpMethod } from ".";
import { MyRequest } from "../utils";
import { Response, NextFunction } from "express";
import * as bcrypt from 'bcrypt';
import { User } from "../models";
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
        {httpMethod: HttpMethod.ALL, path: '*', action: 'loadUser', root: true},
        {httpMethod: HttpMethod.ALL, path: '/login', action: 'login', root: true},
        {httpMethod: HttpMethod.ALL, path: '/register', action: 'register', root: true},
    ]
    
    public loadUser(req: MyRequest, res: Response, next: NextFunction){
        if((req.session && req.session.user) || (req.path == '/login' || req.path == '/register')){
            next();
        }
        else{res.redirect('/login');}
    }

    public async login(req: MyRequest, res: Response, next: NextFunction){
        if(req.body.username && req.body.password){
            let user = await User.findOne({where: {username: req.body.username}}).catch(next);
            if(user){
                if(bcrypt.compareSync(req.body.password, user.password)){
                    req.session.user = user;
                    req.session.save(() => {});
                }
            }
        }

        res.format({
            html: () => { res.render('user/login') },
            json: () => { res.status(204); res.end() }
        })
    }

    public async register(req: MyRequest, res: Response, next: NextFunction){
        if(req.body.username && req.body.password){
            let user = new User(req.body);
            await user.save();
        }

        res.format({
            html: () => { res.render('user/login') },
            json: () => { res.status(204); res.end() }
        })
    }
}
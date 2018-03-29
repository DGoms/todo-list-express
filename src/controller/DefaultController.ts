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
 * @class DefaultController
 * @extends {BaseController}
 */
export class DefaultController extends BaseController{

    protected static routes: IRoute[] = [
        {httpMethod: HttpMethod.ALL, path: '*', action: 'checkLogin'},
        {httpMethod: HttpMethod.ALL, path: '/', action: 'redirectTodos'},
    ]
    
    public checkLogin(req: MyRequest, res: Response, next: NextFunction){
        if((req.session && req.session.user) || (req.path == '/login' || req.path == '/register')){
            next();
        }
        else{res.redirect('/login');}
    }

    public async redirectTodos(req: MyRequest, res: Response, next: NextFunction){
        res.redirect('/todos');
    }
}
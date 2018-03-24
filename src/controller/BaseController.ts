import { Request, Response, NextFunction, Router, IRouterMatcher } from "express";
import { Todo } from "../models/Todo";
import { BadRequestError, NotFoundError, ServerError } from "../utils/Error";
import { User } from "../models/User";

export abstract class BaseController {
    protected static instance: BaseController;
    protected readonly baseUrl: string = '/';
    protected readonly routes: IRoute[] = [];

    protected static getInstance(): BaseController{
        if(!BaseController.instance)
            BaseController.instance = new (<any>this)();

        return BaseController.instance;
    }

    protected constructor() {
    }

    public static init(router: Router): BaseController{
        let controller = new (<any>this)();
        controller.configureRoute(router);
        return controller;
    }

    private configureRoute(router: Router){
        for(let route of this.routes){
            let _router = router;
            _router[route.httpMethod](this.baseUrl + route.path, (req, res, next) => {route.action(req, res, next)});
        }
    }

    protected getUser(): User{
        return null;
    }

    
}

export interface IRoute{
    httpMethod: HttpMethod;
    path: string;
    action: any;
}

export enum HttpMethod{
    ALL = "all",
    GET = "get",
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    DELETE = 'delete'
}
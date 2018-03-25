import { Request, Response, NextFunction, Router, IRouterMatcher } from "express";
import * as Path from 'path';
import { BadRequestError, NotFoundError, ServerError } from "../utils/Error";

export abstract class BaseController {
    /**
     * Singleton
     * 
     * @protected
     * @static
     * @type {BaseController}
     * @memberof BaseController
     */
    protected static instance: BaseController;

    /**
     * Base url of routes
     * 
     * @protected
     * @type {string}
     * @memberof BaseController
     */
    protected static baseUrl: string = '';

    /**
     * Routes of the controller
     * 
     * @protected
     * @type {IRoute[]}
     * @memberof BaseController
     */
    protected static routes: IRoute[] = [];

    protected constructor() {}

    /**
     * Init the controller and routes, finally return the controller instance
     * 
     * @static
     * @param {Router} router 
     * @returns {BaseController} 
     * @memberof BaseController
     */
    public static init(router: Router): void{
        
        this.configureRoute(router);

    }

    /**
     * Add routes of the controllers to the router
     * 
     * @private
     * @param {Router} router 
     * @memberof BaseController
     */
    private static configureRoute(router: Router){
        let controller = new (<any>this)();
        let _router = router;

        for(let route of this.routes){
            let path = route.path;
            if(!route.root) path = Path.join(this.baseUrl, path);

            _router[route.httpMethod](path, (req, res, next) => { controller[route.action](req, res, next)});
        }
    }
}

export interface IRoute{
    httpMethod: HttpMethod;
    path: string;
    action: any;
    root?: boolean
}

export enum HttpMethod{
    ALL = "all",
    GET = "get",
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    DELETE = 'delete'
}
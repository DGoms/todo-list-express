import { Request, Response, NextFunction, Router, IRouterMatcher } from "express";
import * as Path from 'path';
import { BadRequestError, NotFoundError, ServerError } from "../utils/Error";
import { MyRequest } from "../utils";
import { User } from "../models";

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

    protected req: MyRequest;
    protected res: Response;
    protected next: NextFunction;

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
        let controller:BaseController = new (<any>this)();
        let _router = router;

        for(let route of this.routes){
            let method = route.httpMethod || HttpMethod.ALL;

            let path = route.path;
            if(!route.root) path = Path.join(this.baseUrl, path);

            _router[method](path, (req, res, next) => { controller.call(route.action, req, res, next)});
        }
    }

    public call(action: string, req: MyRequest, res: Response, next: NextFunction){
        this.req = req;
        this.res = res;
        this.next = next;

        let _this: any = this;
        _this[action]();
    }

    protected render(view: string, options?: any){
        if(!options)
            options = {};

        options['app'] = {};

        //add user
        if(this.user)
            options['app']['user'] = this.user;

        this.res.render(view, options);
    }

    /**
     * Return the logged user or null
     * 
     * @readonly
     * @protected
     * @type {User}
     * @memberof BaseController
     */
    protected get user(): User{
        if(this.req.session && this.req.session.user)
            return this.req.session.user;
        else
            return null;
    }

    /**
     * Set user as the logged user
     * 
     * @protected
     * @memberof BaseController
     */
    protected set user(user: User){
        this.req.session.user = user;
        this.req.session.save((err) => {
            if(err)
                this.next(err);
        });
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
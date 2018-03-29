import { BaseController, IRoute, HttpMethod } from ".";

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
    
    public async checkLogin(){
        if(await this.getUser() || this.req.path == '/login' || this.req.path == '/register'){
            this.next();
        }
        else{this.res.redirect('/login');}
    }

    public async redirectTodos(){
        this.res.redirect('/todos');
    }
}
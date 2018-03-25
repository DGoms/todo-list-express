import { Request } from "express";
import { Todo, User } from '../models';

export interface MyRequest extends Request{
    todo?: Todo,
    user?: User
}
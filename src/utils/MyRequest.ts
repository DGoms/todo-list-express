import { Request } from "express";
import { Todo, User } from '../models';

export interface MyRequest extends Request{
    todo?: Todo,
    user?: User,
    session?: MySession,
}

export interface MySession extends Express.Session{
    userId?: number,
    alert?: {
        successes?: string[],
        errors?: string[]
    }
}
import { Request } from "express";
import { Todo, User, Team } from '../models';

export interface MyRequest extends Request{
    data?: {
        todo?: Todo,
        user?: User,
        team?: Team,
    }
    session?: MySession,
}

export interface MySession extends Express.Session{
    userId?: number,
    alert?: {
        successes?: string[],
        errors?: string[]
    }
}
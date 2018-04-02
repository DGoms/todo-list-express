import { ValidationError, ValidationErrorItem } from "sequelize";

export class ValidationErrorUtils{
    static itemToStringArray(errors: ValidationErrorItem[]): string[]{
        let ret: string[] = [];
        for (const item of errors) {
            ret.push(item.message);
        }
        return ret;
    }

    static itemToString(errors: ValidationErrorItem[]): string{
        let ret: string = "";
        for (const item of errors) {
            ret += item.message + "; ";
        }
        return ret;
    }
}
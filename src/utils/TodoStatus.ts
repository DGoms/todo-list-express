export enum TodoStatus{
    TODO = "todo",
    IN_PROGRESS = "in_progress",
    DONE = "done",
}

export class TodoStatusUtil{
    static toEnum(value: string): TodoStatus{
        switch(value){
            case TodoStatus.TODO:
            case TodoStatus.IN_PROGRESS:
            case TodoStatus.DONE:
                return value;
            default:
                return undefined;
        }
    }

    static toStringArray(): string[]{
        let array: string[] = [];
        for (let i in TodoStatus) {
            array.push(TodoStatus[i]);
        }
        return array;
    }
}

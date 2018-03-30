import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, DefaultScope, Scopes, Default, NotNull, AllowNull, DataType } from 'sequelize-typescript';
import { User } from './User';
import { TodoStatus, TodoStatusUtil } from '../utils';

@Table({
    tableName: 'todos'
})
@Scopes({
    full: {
        include: [() => User]
    }
})
export class Todo extends Model<Todo>{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @AllowNull(false)
    @Column({
        validate: {
            notEmpty: {
                msg: 'The message is required.'
            }
        }
    })
    message: string;
    
    @Default(TodoStatus.TODO)
    @AllowNull(false)
    @Column({type: DataType.ENUM(TodoStatusUtil.toStringArray())})
    completion: TodoStatus;

    // @Default(true)
    // @Column
    // enabled: boolean;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @ForeignKey(() => User)
    @Column({allowNull: false})
    userId: number;
    
    @BelongsTo(() => User)
    user: User;

}
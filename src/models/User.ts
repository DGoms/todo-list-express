import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, HasMany, DefaultScope, Scopes, Unique, Length } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Todo } from './Todo';

@Table({
    tableName: 'users'
})
@Scopes({
    full: {
        include: [() => Todo]
    }
})
export class User extends Model<User>{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Unique
    @Length({min: 5, max: 255, msg:"Username must be at least 6 characters"})
    @Column({ allowNull: false })
    username: string;

    @Length({min: 5, max: 255, msg: "Password must be at least 6 characters"})
    @Column({ allowNull: false })
    get password(): string{
        return this.getDataValue('password');
    }

    set password(value: string){
        let password = value ? bcrypt.hashSync(value, 10) : undefined;
        this.setDataValue('password', password);
    }

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => Todo)
    todos: Todo[];


}
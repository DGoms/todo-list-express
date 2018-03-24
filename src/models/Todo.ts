import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
    tableName: 'todos'
})
export class Todo extends Model<Todo>{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    message: string;

    @Column
    completion: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @ForeignKey(() => User)
    @Column
    userId: number;
    
    @BelongsTo(() => User)
    user: User;
}
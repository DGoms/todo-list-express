import { Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, DefaultScope, Scopes } from 'sequelize-typescript';
import { User } from './User';

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

    @Column({allowNull: false})
    message: string;

    @Column({allowNull: false})
    completion: string;

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
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Agent } from './agent.model';

@Table({
  tableName: 'chat_histories',
  timestamps: true,
})
export class ChatHistory extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  declare user: User;

  @ForeignKey(() => Agent)
  @Column({ type: DataType.UUID, allowNull: true })
  declare agentId: string | null;

  @BelongsTo(() => Agent, { onDelete: 'CASCADE' })
  declare agent: Agent;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare question: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare answer: string;
}

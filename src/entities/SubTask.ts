import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Todo } from './Todo';

export type SubTaskStatus = 'pending' | 'in-progress' | 'completed';

@Entity('subtasks')
export class SubTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  })
  status!: SubTaskStatus;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'uuid' })
  todoId!: string;

  @ManyToOne(() => Todo, todo => todo.subTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'todoId' })
  todo!: Todo;
}
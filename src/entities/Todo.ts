import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { SubTask } from './SubTask';
import { User } from './User';

export type TodoStatus = 'pending' | 'in-progress' | 'completed' | 'deferred' | 'cancelled';
export type TodoPriority = 'low' | 'medium' | 'high';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in-progress', 'completed', 'deferred', 'cancelled'],
    default: 'pending'
  })
  status!: TodoStatus;

  @Column({
    type: 'enum', 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  })
  priority!: TodoPriority;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate?: Date;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @OneToMany(() => SubTask, subTask => subTask.todo, { cascade: true })
  subTasks?: SubTask[];
}
/**
 * User class to store the information of the user to the mysql
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from 'typeorm';
import { UserRoleMap } from './UserRoleMap';

export enum UserRole {
    ADMIN = "admin",
    STUDENT = "student",
    TRAINER = "trainer",
}

@Entity() 
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ nullable: true, default: UserRole.STUDENT })
    role: string

  @Column({
         nullable:true,
    })
   token: string

  @OneToMany(() => UserRoleMap, userRoleMap => userRoleMap.user)
  public userRoleMaps!: UserRoleMap[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
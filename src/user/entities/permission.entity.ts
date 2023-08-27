import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'permissions',
})
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '权限代码',
    length: 20,
  })
  code: string;

  @Column({
    comment: '权限描述',
    length: 100,
  })
  description: string;
}

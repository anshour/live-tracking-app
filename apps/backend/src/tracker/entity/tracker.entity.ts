import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TrackerHistoryEntity } from './tracker-history';
import { Tracker } from '@livetracking/shared';

@Entity('trackers')
export class TrackerEntity implements Tracker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, name: 'socket_client_id' })
  socketClientId: string;

  @Column({ name: 'is_online' })
  isOnline: boolean;

  @Column({ name: 'last_seen' })
  lastSeen: string;

  @Column({ name: 'last_location_name' })
  lastLocationName: string;

  @Column({
    name: 'last_lat',
    type: 'decimal',
    precision: 11,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  lastLat: number;

  @Column({
    name: 'last_lng',
    type: 'decimal',
    precision: 11,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  lastLng: number;

  @OneToMany(() => TrackerHistoryEntity, (history) => history.tracker)
  histories: TrackerHistoryEntity[];

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id', unique: true })
  userId: number;
}

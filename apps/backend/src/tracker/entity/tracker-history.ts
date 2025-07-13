import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TrackerEntity } from './tracker.entity';
import { TrackerHistory } from '@livetracking/shared';

@Entity('tracker_histories')
export class TrackerHistoryEntity implements TrackerHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'lat',
    type: 'decimal',
    precision: 11,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  lat: number;

  @Column({
    name: 'lng',
    type: 'decimal',
    precision: 11,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  lng: number;

  @ManyToOne(() => TrackerEntity, (tracker) => tracker.histories)
  @JoinColumn({ name: 'tracker_id' })
  tracker: TrackerEntity;

  @Column({ insert: false, update: false, name: 'tracker_id' })
  trackerId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}

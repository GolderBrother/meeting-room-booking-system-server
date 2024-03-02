import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { User } from 'src/user/entities/user.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';

@Injectable()
export class StatisticService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  /**
   * 用户预定次数的统计
   * @param startTime
   * @param endTime
   * @returns
   */
  async userBookingCount(startTime: string, endTime: string) {
    // 用于获取在指定日期范围内预定次数最多的用户的用户名和预定次数。
    // select u.username 用户名, count(*) 预定次数
    // from booking b
    // left join users u
    // on b.userId = u.id
    // where b.startTime between '2023-09-24' and '2023-09-30'
    // group by b.userId;

    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .select('u.id', 'userId')
      .addSelect('u.username', 'username')
      .leftJoin(User, 'u', 'b.userId = u.id')
      .addSelect('count(1)', 'bookingCount')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime,
      })
      .addGroupBy('b.userId')
      .getRawMany();
    return res;
  }

  /**
   * 会议室使用次数统计
   * @param startTime
   * @param endTime
   */
  async meetingRoomUsedCount(startTime: string, endTime: string) {
    // select m.name 会议室名字, count(*) 预定次数
    // from booking b
    // left join meeting_room m
    // on b.roomId = m.id
    // where b.startTime between '2023-09-24' and '2023-09-30'
    // group by b.roomId;

    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .select('m.id', 'meetingRoomId')
      .addSelect('m.name', 'meetingRoomName')
      .leftJoin(MeetingRoom, 'm', 'b.roomId = m.id')
      .addSelect('count(1)', 'usedCount')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime,
      })
      .addGroupBy('b.roomId')
      .getRawMany();
    return res;
  }
}

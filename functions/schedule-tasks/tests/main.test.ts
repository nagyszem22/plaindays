import 'mocha';
import { expect } from 'chai';
// @ts-expect-error
import { findFreeTimeSlots, scheduleTask, schedule, ScheduleType } from '../src/main.ts';
// @ts-expect-error
import { getTasks, getTask } from './inputs/tasks.ts';
import { DateTime } from 'luxon';

const DEFAULT_TIME_ZONE = 'Europe/London';

// CONTINUE HERE WITH MORE TEST CASES BASED ON REAL LIFE TESTS

describe('findFreeTimeSlots', function() {
  it('should find time slots if there are no scheduled events', function() {
    const start = new Date('2021-09-30T10:00:00.000+01:00');
    const timeSlots = findFreeTimeSlots([], DEFAULT_TIME_ZONE, start);
    
    expect(timeSlots).to.have.lengthOf(1);
    expect(timeSlots[0].start, start);
    expect(timeSlots[0].end, undefined);
  });

  it('should find correct time slots if there are 2 scheduled events today', function() {
    const start = new Date('2021-09-30T09:00:00.000+01:00');
    const input = getTasks([
      { start: new Date('2021-09-30T10:00:00.000+01:00'), end: new Date('2021-09-30T11:00:00.000+01:00') },
      { start: new Date('2021-09-30T14:30:00.000+01:00'), end: new Date('2021-09-30T15:00:00.000+01:00') }
    ]);
    const expectedOutput = [
      { start: DateTime.fromISO('2021-09-30T09:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T10:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T11:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T14:30:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T15:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: undefined }
    ];
    const output = findFreeTimeSlots(input, DEFAULT_TIME_ZONE, start);
    
    expect(output).to.deep.equal(expectedOutput);
  });

  it('should find correct time slots if there are 4 scheduled events today', function() {
    const start = new Date('2021-09-30T09:00:00.000+01:00');
    const input = getTasks([
      { start: new Date('2021-09-30T10:00:00.000+01:00'), end: new Date('2021-09-30T11:00:00.000+01:00') },
      { start: new Date('2021-09-30T14:30:00.000+01:00'), end: new Date('2021-09-30T15:00:00.000+01:00') },
      { start: new Date('2021-09-30T15:30:00.000+01:00'), end: new Date('2021-09-30T16:00:00.000+01:00') },
      { start: new Date('2021-09-30T16:00:00.000+01:00'), end: new Date('2021-09-30T17:00:00.000+01:00') },
    ]);
    const expectedOutput = [
      { start: DateTime.fromISO('2021-09-30T09:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T10:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T11:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T14:30:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T15:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T15:30:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T17:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: undefined },
    ];
    const output = findFreeTimeSlots(input, DEFAULT_TIME_ZONE, start);
    
    expect(output).to.deep.equal(expectedOutput);
  });

  it('should find correct time slots if tasks are not ordered by start date', function() {
    const start = new Date('2021-09-30T09:00:00.000+01:00');
    const input = getTasks([
      { start: new Date('2021-09-30T15:30:00.000+01:00'), end: new Date('2021-09-30T16:00:00.000+01:00') },
      { start: new Date('2021-09-30T10:00:00.000+01:00'), end: new Date('2021-09-30T11:00:00.000+01:00') },
      { start: new Date('2021-09-30T14:30:00.000+01:00'), end: new Date('2021-09-30T15:00:00.000+01:00') },
      { start: new Date('2021-09-30T16:00:00.000+01:00'), end: new Date('2021-09-30T17:00:00.000+01:00') },
    ]);
    const expectedOutput = [
      { start: DateTime.fromISO('2021-09-30T09:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T10:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T11:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T14:30:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T15:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T15:30:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T17:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: undefined },
    ];
    const output = findFreeTimeSlots(input, DEFAULT_TIME_ZONE, start);
    
    expect(output).to.deep.equal(expectedOutput);
  });

  it('should find correct time slots if there is an ongoing event right now', function() {
    const start = new Date('2021-09-30T10:15:00.000+01:00');
    const input = getTasks([
      { start: new Date('2021-09-30T10:00:00.000+01:00'), end: new Date('2021-09-30T11:00:00.000+01:00') },
      { start: new Date('2021-09-30T14:30:00.000+01:00'), end: new Date('2021-09-30T15:00:00.000+01:00') }
    ]);
    const expectedOutput = [
      { start: DateTime.fromISO('2021-09-30T11:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T14:30:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T15:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: undefined }
    ];
    const output = findFreeTimeSlots(input, DEFAULT_TIME_ZONE, start);
    
    expect(output).to.deep.equal(expectedOutput);
  });

  it('should find correct time slots if the current time is not divisible by 5', function() {
    const start = new Date('2021-09-30T10:12:10.000+01:00');
    const input = getTasks([
      { start: new Date('2021-09-30T11:00:00.000+01:00'), end: new Date('2021-09-30T12:00:00.000+01:00') }
    ]);
    const expectedOutput = [
      { start: DateTime.fromISO('2021-09-30T10:15:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: DateTime.fromISO('2021-09-30T11:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }) },
      { start: DateTime.fromISO('2021-09-30T12:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }), end: undefined }
    ];
    const output = findFreeTimeSlots(input, DEFAULT_TIME_ZONE, start);
    
    expect(output).to.deep.equal(expectedOutput);
  });
});

describe('scheduleTask', function() {
  it('should schedule a 30 minutes work task if only one free timeslot', function() {
    const start = DateTime.fromISO('2021-09-30T01:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE });
    const freeTimeSlots = [{
      start: start,
      end: undefined
    }];
    const workHours = { start: 9, end: 18 };
    const dayHours = { start: 8, end: 22 };
    const task = getTask({});

    const expectedOutput = getTask({
      start: new Date('2021-09-30T09:00:00.000+01:00'),
      end: new Date('2021-09-30T09:30:00.000+01:00'),
    });

    const output = scheduleTask(workHours, dayHours, freeTimeSlots, task);

    expect(output).to.deep.equal(expectedOutput);
  });

  it('should schedule a 30 minutes outside work hours task if only one free timeslot', function() {
    const start = DateTime.fromISO('2021-09-30T01:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE });
    const freeTimeSlots = [{
      start: start,
      end: undefined
    }];
    const workHours = { start: 9, end: 18 };
    const dayHours = { start: 8, end: 22 };
    const task = getTask({
      scheduleType: ScheduleType.OUTSIDE_WORK_HOURS
    });

    const expectedOutput = getTask({
      start: new Date('2021-09-30T08:00:00.000+01:00'),
      end: new Date('2021-09-30T08:30:00.000+01:00'),
      scheduleType: ScheduleType.OUTSIDE_WORK_HOURS
    });

    const output = scheduleTask(workHours, dayHours, freeTimeSlots, task);

    expect(output).to.deep.equal(expectedOutput);
  });

  it('should schedule a task for next day if there are no relevant slots today', function() {
    const start = DateTime.fromISO('2021-09-30T01:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE });
    const freeTimeSlots = [{
      start: start,
      end: DateTime.fromISO('2021-09-30T09:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE })
    },{
      start: DateTime.fromISO('2021-09-30T11:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }),
      end: DateTime.fromISO('2021-09-30T12:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE })
    }, {
      start: DateTime.fromISO('2021-09-30T19:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }),
      end: DateTime.fromISO('2021-09-30T21:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE })
    }, {
      start: DateTime.fromISO('2021-10-01T15:00:00.000+01:00', { zone: DEFAULT_TIME_ZONE }),
      end: undefined
    }];
    const workHours = { start: 9, end: 18 };
    const dayHours = { start: 8, end: 22 };
    const task = getTask({
      scheduleType: ScheduleType.WORK_HOURS,
      duration: 2 * 60 * 60 * 1000,
      canSplit: false
    });

    const output = scheduleTask(workHours, dayHours, freeTimeSlots, task);

    const expectedOutput = getTask({
      start: new Date('2021-10-01T15:00:00.000+01:00'),
      end: new Date('2021-10-01T17:00:00.000+01:00'),
      duration: 2 * 60 * 60 * 1000,
      canSplit: false
    });

    expect(output).to.deep.equal(expectedOutput);
  });
});

describe('schedule', function() {
  it('should schedule tasks', function() {
    const start = new Date('2021-09-30T01:00:00.000+01:00');
    const workHours = { start: 9, end: 18 };
    const dayHours = { start: 8, end: 22 };
    const tasks = getTasks([
      { duration: 30 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00') },
      { duration: 1.5 * 60 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00') },
      { duration: 2 * 60 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00') },
      { duration: 3 * 60 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00') },
      { duration: 2 * 60 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00') },
      { duration: 1.5 * 60 * 60 * 1000, deadline: new Date('2021-10-01T00:00:00.000+01:00') },
      { duration: 30 * 60 * 1000, deadline: new Date('2021-10-01T00:00:00.000+01:00') },
      { duration: 45 * 60 * 1000, deadline: new Date('2021-10-01T00:00:00.000+01:00') }
    ]);

    const output = schedule(workHours, dayHours, DEFAULT_TIME_ZONE, tasks, start);

    expect(output).to.have.lengthOf(8);

    const expectedOutput = [
      getTask({
        id: output[0].id,
        start: new Date('2021-09-30T09:00:00.000+01:00'),
        end: new Date('2021-09-30T11:00:00.000+01:00'),
        duration: 2 * 60 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00')
      }),
      getTask({
        id: output[1].id,
        start: new Date('2021-09-30T11:00:00.000+01:00'),
        end: new Date('2021-09-30T14:00:00.000+01:00'),
        duration: 3 * 60 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00')
      }),
      getTask({
        id: output[2].id,
        start: new Date('2021-09-30T14:00:00.000+01:00'),
        end: new Date('2021-09-30T16:00:00.000+01:00'),
        duration: 2 * 60 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00')
      }),
      getTask({
        id: output[3].id,
        start: new Date('2021-09-30T16:00:00.000+01:00'),
        end: new Date('2021-09-30T17:30:00.000+01:00'),
        duration: 1.5 * 60 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00')
      }),
      getTask({
        id: output[4].id,
        start: new Date('2021-09-30T17:30:00.000+01:00'),
        end: new Date('2021-09-30T18:00:00.000+01:00'),
        duration: 30 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00')
      }),
      getTask({
        id: output[5].id,
        start: new Date('2021-10-01T09:00:00.000+01:00'),
        end: new Date('2021-10-01T09:45:00.000+01:00'),
        duration: 45 * 60 * 1000,
        deadline: new Date('2021-10-01T00:00:00.000+01:00')
      }),
      getTask({
        id: output[6].id,
        start: new Date('2021-10-01T09:45:00.000+01:00'),
        end: new Date('2021-10-01T10:15:00.000+01:00'),
        duration: 30 * 60 * 1000,
        deadline: new Date('2021-10-01T00:00:00.000+01:00')
      }),
      getTask({
        id: output[7].id,
        start: new Date('2021-10-01T10:15:00.000+01:00'),
        end: new Date('2021-10-01T11:45:00.000+01:00'),
        duration: 1.5 * 60 * 60 * 1000,
        deadline: new Date('2021-10-01T00:00:00.000+01:00')
      }),
    ];

    expect(output).to.deep.equal(expectedOutput);
  });
  
  it('should schedule tasks with different schedule types', function() {
    const start = new Date('2021-09-30T00:00:00.000+01:00');
    const workHours = { start: 9, end: 18 };
    const dayHours = { start: 8, end: 22 };
    const tasks = getTasks([
      { duration: 30 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00'), scheduleType: ScheduleType.OUTSIDE_WORK_HOURS },
      { duration: 1.5 * 60 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00') },
      { duration: 1 * 60 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00') },
      { duration: 4.5 * 60 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00') },
      { duration: 1 * 60 * 60 * 1000, deadline: new Date('2021-09-30T00:00:00.000+01:00'), scheduleType: ScheduleType.OUTSIDE_WORK_HOURS },
    ]);

    const output = schedule(workHours, dayHours, DEFAULT_TIME_ZONE, tasks, start);

    expect(output).to.have.lengthOf(5);
    output.sort((a, b) => (a.start && b.start ? a.start.toMillis() - b.start.toMillis() : 0));

    const expectedOutput = [
      getTask({
        id: output[0].id,
        start: new Date('2021-09-30T08:00:00.000+01:00'),
        end: new Date('2021-09-30T09:00:00.000+01:00'),
        duration: 1 * 60 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00'),
        scheduleType: ScheduleType.OUTSIDE_WORK_HOURS
      }),
      getTask({
        id: output[1].id,
        start: new Date('2021-09-30T09:00:00.000+01:00'),
        end: new Date('2021-09-30T13:30:00.000+01:00'),
        duration: 4.5 * 60 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00')
      }),
      getTask({
        id: output[2].id,
        start: new Date('2021-09-30T13:30:00.000+01:00'),
        end: new Date('2021-09-30T14:30:00.000+01:00'),
        duration: 1 * 60 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00')
      }),
      getTask({
        id: output[3].id,
        start: new Date('2021-09-30T14:30:00.000+01:00'),
        end: new Date('2021-09-30T16:00:00.000+01:00'),
        duration: 1.5 * 60 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00')
      }),
      getTask({
        id: output[4].id,
        start: new Date('2021-09-30T18:00:00.000+01:00'),
        end: new Date('2021-09-30T18:30:00.000+01:00'),
        duration: 30 * 60 * 1000,
        deadline: new Date('2021-09-30T00:00:00.000+01:00'),
        scheduleType: ScheduleType.OUTSIDE_WORK_HOURS
      }),
    ];

    expect(output).to.deep.equal(expectedOutput);
  });
});
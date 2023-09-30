// @ts-expect-error
import { Task, Urgency, ScheduleType } from '../../src/main.ts';
import { DateTime } from 'luxon';

type TaskInput = {
  id?: string
  parentID?: string
  deadline?: Date
  urgency?: Urgency
  priority?: number
  scheduleType?: ScheduleType
  duration?: number
  canSplit?: boolean
  isSplit?: boolean
  isDone?: boolean
  start?: Date
  end?: Date
}

const DEFAULT_TIME_ZONE = 'Europe/London';

export function getTasks(taskInputs: TaskInput[]): Task[] {
  return taskInputs.map((input, index) => getTask({ ...input, id: `test_id_${index}` }));
}

export function getTask({
  id = 'test_id',
  parentID = undefined,
  deadline = new Date('2021-09-30T22:00:00.000+01:00'), 
  urgency = Urgency.TODAY, 
  priority = 2, 
  scheduleType = ScheduleType.WORK_HOURS,
  duration = 30 * 60 * 1000,
  canSplit = true,
  isSplit = false,
  isDone = false,
  start = undefined,
  end = undefined }: TaskInput): Task {
    return {
      id,
      parentID,
      deadline: DateTime.fromJSDate(deadline, { zone: DEFAULT_TIME_ZONE }),
      urgency,
      priority,
      scheduleType,
      duration,
      canSplit,
      isSplit,
      isDone,
      start: start ? DateTime.fromJSDate(start, { zone: DEFAULT_TIME_ZONE }) : undefined,
      end: end ? DateTime.fromJSDate(end, { zone: DEFAULT_TIME_ZONE }) : undefined,
    };
};
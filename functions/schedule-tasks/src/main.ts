import { Client, Databases, Account, Query } from 'node-appwrite';
import { v4 as uuidv4 } from 'uuid';
import { DateTime, Duration } from "luxon";
import  { appwriteEndpoint, adb, adbc } from './config.js';

export type Task = {
  id?: string
  title?: string
  content?: string
  parentID?: string
  deadline: DateTime
  urgency: Urgency
  priority: number
  scheduleType: ScheduleType
  duration: number
  canSplit: boolean
  isSplit: boolean
  isDone: boolean
  userID?: string
  start?: DateTime
  end?: DateTime
}

export type UpsertTasks = {
  create: Task[]
  update: Task[]
}

export type WorkHours = {
  start: number
  end: number
}

export type DayHours = {
  start: number
  end: number
}

export enum ScheduleType {
  WORK_HOURS,
  OUTSIDE_WORK_HOURS,
  WEEKEND,
  NONE
}

export enum Urgency {
  TODAY,
  TOMORROW,
  THIS_WEEK,
  NEXT_WEEK,
  FIXED,
  THIS_MONTH
}

export type TimeSlot = {
  start: DateTime
  end?: DateTime
}

const DEFAULT_WORK_HOURS: WorkHours = {
  start: 9,
  end: 18
};
const DEFAULT_DAY_HOURS: WorkHours = {
  start: 8,
  end: 22
};
const DEFAULT_TIME_ZONE: string = 'Europe/London';

export default async ({ req, res, error }) => {
  const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);

  if (req.headers['x-appwrite-user-jwt']) {
    client.setJWT(req.headers['x-appwrite-user-jwt']);
  } else {
    error('Failed to retreive user jwt');
    return res.send('Please login');
  }

  const account = new Account(client);
  const databases = new Databases(client);
  try {
    // @TODO: log that the scheduled tasks are being processed
    // if there is another task that is currenlty being processed, abort

    // @TODO: get the following user preferences: workHours, dayHours
    const preferences: { dayStart?: number, dayEnd?: number, workStart?: number, workEnd?: number, timeZone?: string  } = await account.getPrefs();
    const { dayStart, dayEnd, workStart, workEnd, timeZone } = preferences || {};

    const workHours: WorkHours = {
      start: workStart || DEFAULT_WORK_HOURS.start,
      end: workEnd || DEFAULT_WORK_HOURS.end
    };
    const dayHours: DayHours = {
      start: dayStart || DEFAULT_DAY_HOURS.start,
      end: dayEnd || DEFAULT_DAY_HOURS.end
    };
    const tz: string = timeZone || DEFAULT_TIME_ZONE;

    // @TODO: validate tasks making sure that they can actually be scheduled and fit in the desired time slots

    const collection = await databases.listDocuments(adb['App'], adbc['Events'], [
      Query.select(['$id', 'deadline', 'urgency', 'priority', 'scheduleType', 'duration', 'canSplit', 'start', 'end']),
      Query.equal('isDone', [ false ]),
      Query.notEqual('urgency', [ 'NONE' ]),
    ]);

    const tasks: Task[] = Array.isArray(collection?.documents) ? collection.documents.map((document: any) => {
      const task: Task = mapDocumentToTask(document);
      return task;
    }) : [];

    const update = schedule(workHours, dayHours, tz, tasks);

    const updatePromises = update.map(({ id, start, end }) => {
      return databases.updateDocument(adb['App'], adbc['Events'], id, { start, end });
    });
    await Promise.all(updatePromises);


    // @TODO: log that the scheduled tasks are done being processed

    return res.send('Collection retrieved');
  } catch (e) {
    error('Failed to get collection: ' + e.message);
    error(e.stack);

    // @TODO: log that the scheduled tasks are done being processed

    return res.send('Failed to retrieve collection');
  }
}

function mapDocumentToTask(document: any): Task {
  const task: Task = {
    id: document.$id,
    title: document.title,
    content: document.content,
    parentID: document.parentID,
    deadline: DateTime.fromISO(document.deadline, { zone: DEFAULT_TIME_ZONE }),
    urgency: (() => {
      switch (document.urgency) {
        case 'TODAY':
          return Urgency.TODAY;
        case 'TOMORROW':
            return Urgency.TOMORROW;
        case 'THIS_WEEK':
            return Urgency.THIS_WEEK;
        case 'NEXT_WEEK':
            return Urgency.NEXT_WEEK;
        case 'FIXED':
            return Urgency.FIXED;
        case 'THIS_MONTH':
            return Urgency.THIS_MONTH;
      }
    })(),
    priority: document.priority,
    scheduleType: (() => {
      switch (document.scheduleType) {
        case 'WORK_HOURS':
          return ScheduleType.WORK_HOURS;
        case 'OUTSIDE_WORK_HOURS':
          return ScheduleType.OUTSIDE_WORK_HOURS;
        case 'BEFORE_WORK_HOURS':
          return ScheduleType.OUTSIDE_WORK_HOURS;
        case 'AFTER_WORK_HOURS':
          return ScheduleType.OUTSIDE_WORK_HOURS;
        case 'WEEKEND':
          return ScheduleType.WEEKEND;
        case 'NONE':
          return ScheduleType.NONE;
      }
    })(),
    duration: document.duration,
    canSplit: document.canSplit,
    isSplit: document.isSplit,
    isDone: document.isDone,
    userID: document.userID,
    start: document.start ? DateTime.fromISO(document.start, { zone: DEFAULT_TIME_ZONE }) : undefined,
    end: document.end ? DateTime.fromISO(document.end, { zone: DEFAULT_TIME_ZONE }) : undefined
  };
  return task;
}

export function schedule(workHours: WorkHours, dayHours: DayHours, timeZone: string, tasks: Task[], testDate: Date = null): Task[] {
  const now: DateTime = testDate ? DateTime.fromJSDate(testDate, { zone: timeZone }) : DateTime.now().setZone(timeZone);
  const originalTasks: Task[] = [ ...tasks.map(task => ({ ...task })) ];

  // initialize the scheduled tasks with the fixed ones and filter out past ones
  const scheduledTasks: Task[] = tasks.filter(task => task.urgency === Urgency.FIXED && task.end > now)
    .sort((a, b) => (a.start.toMillis() - b.start.toMillis()));

  // initialize unscheduled tasks with the non-fixed ones and sort them by deadline and priority ascending
  const unscheduledTasks: Task[] = tasks.filter(task => task.urgency !== Urgency.FIXED).sort((a, b) => {
    if (b.deadline < a.deadline) {
      return -1;
    } else if (b.deadline > a.deadline) {
      return 1;
    } else {
      return b.priority - a.priority;
    }
  });

  // while (unscheduledTasks.length > 0) {
  while (unscheduledTasks.length > 0) {
    // get the current task
    const task: Task = unscheduledTasks.pop();

    // find the free time slots
    const freeTimeSlots: TimeSlot[] = findFreeTimeSlots(scheduledTasks, timeZone, testDate);

    // schedule the current task and split it if necessary
    const scheduledTask: Task = scheduleTask(workHours, dayHours, freeTimeSlots, task);

    // add the scheduled task to the scheduled tasks
    scheduledTasks.push(scheduledTask);
  }

  // CONTINUE HERE: CHECK IF THE NULL UPDATES WORK
  return scheduledTasks.filter(item => {
    const originalTask: Task = originalTasks.find(task => task.id === item.id);
    return originalTask && (originalTask.start !== item.start || originalTask.end !== item.end);
  });
}

export function findFreeTimeSlots(scheduledTasks: Task[], timeZone: string, testDate: Date = null): TimeSlot[] {
  const freeTimeSlots: TimeSlot[] = [];
  let start: DateTime = testDate ? DateTime.fromJSDate(testDate, { zone: timeZone }) : DateTime.now().setZone(timeZone);
  let end: DateTime = undefined;
  start = start.plus({ minutes: start.minute === 0 ? 0 : 5 - (start.minute % 5) }).set({ second: 0, millisecond: 0 });

  const scheduledTasksCopy = [
    ...scheduledTasks
      .map(task => ({ ...task }))
      .filter(item => item.start && item.end)
      .sort((a, b) => (a.start && b.start ? a.start.toMillis() - b.start.toMillis() : 0))
  ];

  // console.log('scheduledTasksCopy', scheduledTasksCopy.map(item => ({ start: item.start.toISO(), end: item.end.toISO() })));

  if (!scheduledTasksCopy || scheduledTasksCopy.length === 0) {
    return [{ start, end }];
  }

  const [ firstTask ] = scheduledTasksCopy;
  if (firstTask.end > start && firstTask.start < start) {
    start = firstTask.end;
  }

  scheduledTasksCopy.forEach(({ start: tStart, end: tEnd }) => {
    if (tStart.toMillis() >= start.toMillis()) {
      end = tStart;
      if (start && end.diff(start).as('minutes') >= 5) {
        freeTimeSlots.push({ start, end });
      }
      start = tEnd;
    }
  });

  freeTimeSlots.push({ start, end: undefined });

  return freeTimeSlots; 
}

// schedule the current task
// returns an array of two tasks: the scheduled task and a remainder task
// if no splitting is necessary, the remainder is undefined
export function scheduleTask(workHours: WorkHours, dayHours: DayHours, freeTimeSlots: TimeSlot[], task: Task): Task {
  const { duration: dur, scheduleType } = task;
  const duration: Duration = Duration.fromObject({ milliseconds: dur })

  for (let i = 0; i < freeTimeSlots.length; i++) {
    const slot = freeTimeSlots[i];
    let days: number = slot.end ? slot.end.diff(slot.start, 'days').as('days') : 365;

    for (let j = 0; j <= days; j++) {
      const today: DateTime = slot.start.plus({ days: j });

      let slotStart: DateTime = null;
      let slotEnd: DateTime = null;

      const startDay = today.set({
        hour: Math.floor(dayHours.start),
        minute: (dayHours.start - Math.floor(dayHours.start)) * 60,
        second: 0,
        millisecond: 0
      });
      const endDay: DateTime = today.set({
        hour: Math.floor(dayHours.end),
        minute: (dayHours.end - Math.floor(dayHours.end)) * 60,
        second: 0,
        millisecond: 0
      });

      const startWork: DateTime = today.set({
        hour: Math.floor(workHours.start),
        minute: (workHours.start - Math.floor(workHours.start)) * 60,
        second: 0,
        millisecond: 0
      });
      const endWork: DateTime = today.set({
        hour: Math.floor(workHours.end),
        minute: (workHours.end - Math.floor(workHours.end)) * 60,
        second: 0,
        millisecond: 0
      });

      // if weekend
      // CONTINUE HERE!!! FIGURE OUT WHY ISN'T THIS WORKING BY WRITING TESTS
      if (today.weekday > 5) {
        if (scheduleType === ScheduleType.WORK_HOURS) {
          continue;
        }

        slotStart = startDay > slot.start ? startDay : slot.start;
        slotEnd = !slot.end || endDay < slot.end ? endDay : slot.end;

      // if weekday
      } else {
        if (scheduleType === ScheduleType.WEEKEND) {
          continue;
        }

        if (scheduleType === ScheduleType.WORK_HOURS) {
          slotStart = startWork > slot.start ? startWork : slot.start;
          slotEnd = !slot.end || endWork < slot.end ? endWork : slot.end;
        }

        if (scheduleType === ScheduleType.NONE) {
          slotStart = startDay > slot.start ? startDay : slot.start;
          slotEnd = !slot.end || endDay < slot.end ? endDay : slot.end;
        }

        if (scheduleType === ScheduleType.OUTSIDE_WORK_HOURS) {
          if (slot.start < startDay) {
            slotStart = startDay;
          } else if (slot.start < startWork) {
            slotStart = slot.start;
          } else if (slot.start < endWork) {
            slotStart = endWork;
          } else {
            slotStart = slot.start < endDay ? slot.start : endDay;
          }

          if (slot.end < startWork) {
            slotEnd = slot.end;
          } else if (slot.end < endWork) {
            slotEnd = startWork;
          } else {
            slotEnd = !slot.end || slot.end > endDay ? endDay : slot.end;
          }
        }
      }

      const slotDuration: Duration = slotEnd.diff(slotStart);

      if (duration <= slotDuration) {
        task.start = slotStart;
        task.end = slotStart.plus(duration);

        return task;
      }
    }
  }

  return task;
}
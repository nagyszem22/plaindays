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
  AFTER_WORK_HOURS,
  BEFORE_WORK_HOURS,
  NONE
}

export enum Urgency {
  TODAY,
  TOMORROW,
  THIS_WEEK,
  NEXT_WEEK,
  FIXED,
  THIS_MONTH,
  NONE
}

export type TimeSlot = {
  start: DateTime
  end?: DateTime
}

const MIN_SPLIT_DURATION: number = 0.5;
const DEFAULT_WORK_HOURS: WorkHours = {
  start: 9,
  end: 18
};
const DEFAULT_DAY_HOURS: WorkHours = {
  start: 8,
  end: 22
};
const DEFAULT_TIME_ZONE: string = 'Europe/London';

export default async ({ req, res, log, error }) => {
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
    // @TODO add database and collection id to environment variables
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
    // a task can not be longer then the duration of the slot it is scheduled for if it can not be split

    const collection = await databases.listDocuments(adb['App'], adbc['Events'], [
      Query.select(['$id', 'title', 'content', 'parentID', 'deadline', 'urgency', 'priority', 'scheduleType', 'duration', 'canSplit',
        'isSplit', 'isDone', 'userID', 'start', 'end']),
      Query.equal('isDone', [ false ]),
    ]);

    const tasks: Task[] = Array.isArray(collection?.documents) ? collection.documents.map((document: any) => {
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
            case 'NONE':
                return Urgency.NONE;
          }
        })(),
        priority: document.priority,
        scheduleType: (() => {
          switch (document.scheduleType) {
            case 'WORK_HOURS':
              return ScheduleType.WORK_HOURS;
            case 'AFTER_WORK_HOURS':
              return ScheduleType.AFTER_WORK_HOURS;
            case 'BEFORE_WORK_HOURS':
              return ScheduleType.BEFORE_WORK_HOURS;
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
    }).filter(({ parentID }) => !parentID) : [];

    const { create, update } = schedule(workHours, dayHours, tz, tasks);
    
    // delete all tasks that does have a parentID
    const documentsWithParentIDs: any[] = Array.isArray(collection?.documents) ? collection.documents.filter(({ parentID }: any) => parentID) : [];
    log({ documentsWithParentIDs });
    const deletePromises = documentsWithParentIDs.map(({ $id }: any) => databases.deleteDocument('64d2c0765d92b052b3e0', '6501cbe36f6bb2db7c6f', $id));
    await Promise.all(deletePromises);

    // @TOOD: create the create and update methods
    // make sure to wait one minute if more than 120
    const createPromises = create.map(({ id, ...document }) => {
      return databases.createDocument('64d2c0765d92b052b3e0', '6501cbe36f6bb2db7c6f', id, {
        ...document,
        urgency: (() => {
          switch (document.urgency) {
            case Urgency.TODAY:
              return 'TODAY';
            case Urgency.TOMORROW:
              return 'TOMORROW';
            case Urgency.THIS_WEEK:
              return 'THIS_WEEK';
            case Urgency.NEXT_WEEK:
              return 'NEXT_WEEK';
            case Urgency.FIXED:
              return 'FIXED';
            case Urgency.THIS_MONTH:
              return 'THIS_MONTH';
          }
        })(),
        scheduleType: (() => {
          switch (document.scheduleType) {
            case ScheduleType.WORK_HOURS:
              return 'WORK_HOURS';
            case ScheduleType.AFTER_WORK_HOURS:
              return 'AFTER_WORK_HOURS';
            case ScheduleType.BEFORE_WORK_HOURS:
              return 'BEFORE_WORK_HOURS';
            case ScheduleType.NONE:
              return 'NONE';
          }
        })()
      });
    });
    await Promise.all(createPromises);

    const updatePromises = update.map(({ id, start, end }) => {
      return databases.updateDocument('64d2c0765d92b052b3e0', '6501cbe36f6bb2db7c6f', id, { start, end });
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

export function schedule(workHours: WorkHours, dayHours: DayHours, timeZone: string, tasks: Task[], testDate: Date = null): UpsertTasks {
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
    const [ scheduledTask, remainderTask ]: Task[] = scheduleTask(workHours, dayHours, timeZone, freeTimeSlots, task);

    // add the scheduled task to the scheduled tasks
    scheduledTasks.push(scheduledTask);

    // if there is a remainder, add it to the unscheduled tasks
    if (remainderTask) {
      unscheduledTasks.push(remainderTask);
    }
  }

  // CONTINUE HERE: CHECK IF THe NULL UPDATES WORK
  const existingIDs: string[] = originalTasks.map(({ id }) => id);
  const parentIDs: string[] = Array.from(new Set(originalTasks.map(({ parentID }) => parentID)));
  const upsertTasks: UpsertTasks = {
    create: scheduledTasks.filter(({ id }) => !existingIDs.includes(id)),
    update: [
      ...scheduledTasks.filter(({ id }) => !parentIDs.includes(id)).filter(({ id, start, end }) => {
        const existingTask: Task = originalTasks.find(el => el.id === id);
        return existingTask && (existingTask.start?.toMillis() !== start?.toMillis() || existingTask.end?.toMillis() !== end?.toMillis())
      }),
      ...originalTasks.filter(({ id }) => parentIDs.includes(id)).map((task) => ({ ...task, start: null, end: null }))
    ]
  };

  return upsertTasks;
}

export function findFreeTimeSlots(scheduledTasks: Task[], timeZone: string, testDate: Date = null): TimeSlot[] {
  const freeTimeSlots: TimeSlot[] = [];
  let start: DateTime = testDate ? DateTime.fromJSDate(testDate, { zone: timeZone }) : DateTime.now().setZone(timeZone);
  let end: DateTime = undefined;
  start = start.plus({ minutes: start.minute === 0 ? 0 : 5 - (start.minute % 5) }).set({ second: 0, millisecond: 0 });

  const scheduledTasksCopy = [ ...scheduledTasks ];

  scheduledTasksCopy.sort((a, b) => (a.start && b.start ? a.start.toMillis() - b.start.toMillis() : 0));

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
export function scheduleTask(workHours: WorkHours, dayHours: DayHours, timeZone: string, freeTimeSlots: TimeSlot[], task: Task): Task[] {
  const { duration: dur, canSplit, scheduleType } = task;
  const duration: Duration = Duration.fromObject({ milliseconds: dur })

  // @TODO: check if task can be scheduled
  // if can not be split and is longer than the maximum allowed duration
  // then save it as a task that can not be scheduled
  // (otherwise the while loop will run forever)

  for (let i = 0; i < freeTimeSlots.length; i++) {
    const slot = freeTimeSlots[i];
    let days: number = slot.end ? slot.end.diff(slot.start, 'days').as('days') : 365;

    for (let j = 0; j <= days; j++) {
      const today: DateTime = slot.start.plus({ days: j });

      const startBeforeWork: DateTime = today.set({
        hour: Math.floor(dayHours.start),
        minute: (dayHours.start - Math.floor(dayHours.start)) * 60,
        second: 0,
        millisecond: 0
      });

      const endBeforeWork: DateTime = today.set({
        hour: Math.floor(workHours.start),
        minute: (workHours.start - Math.floor(workHours.start)) * 60,
        second: 0,
        millisecond: 0
      });

      const startWork: DateTime = endBeforeWork;

      const endWork: DateTime = today.set({
        hour: Math.floor(workHours.end),
        minute: (workHours.end - Math.floor(workHours.end)) * 60,
        second: 0,
        millisecond: 0
      });

      const startAfterWork: DateTime = endWork;

      const endAfterWork: DateTime = today.set({
        hour: Math.floor(dayHours.end),
        minute: (dayHours.end - Math.floor(dayHours.end)) * 60,
        second: 0,
        millisecond: 0
      });
      
      let slotStart: DateTime = null;
      let slotEnd: DateTime = null;
      if (scheduleType === ScheduleType.WORK_HOURS) {
        slotStart = startWork > slot.start ? startWork : slot.start;
        slotEnd = !slot.end || endWork < slot.end ? endWork : slot.end;
      }
      if (scheduleType === ScheduleType.BEFORE_WORK_HOURS) {
        slotStart = startBeforeWork > slot.start ? startBeforeWork : slot.start;
        slotEnd = !slot.end || endBeforeWork < slot.end ? endBeforeWork : slot.end;
      }
      if (scheduleType === ScheduleType.AFTER_WORK_HOURS) {
        slotStart = startAfterWork > slot.start ? startAfterWork : slot.start;
        slotEnd = !slot.end || endAfterWork < slot.end ? endAfterWork : slot.end;
      }
      if (scheduleType === ScheduleType.NONE) {
        slotStart = startBeforeWork > slot.start ? startBeforeWork : slot.start;
        slotEnd = !slot.end || endAfterWork < slot.end ? endAfterWork : slot.end;
      }

      const slotDuration: Duration = slotEnd.diff(slotStart);

      if (duration <= slotDuration) {
        task.start = slotStart;
        task.end = slotStart.plus(duration);

        return [task, null ];
      }

      if (canSplit && duration > slotDuration && slotDuration.as('hours') >= MIN_SPLIT_DURATION) {
        const newTask: Task = {
          ...task,
          id: uuidv4(),
          parentID: task.id,
          duration: slotDuration.as('milliseconds'),
          start: slotStart,
          end: slotEnd 
        };
        const remainderTask: Task = {
          ...task,
          id: uuidv4(),
          parentID: task.parentID || task.id,
          duration: duration.as('milliseconds') - slotDuration.as('milliseconds'),
        };

        return [ newTask, remainderTask ];
      }
    }
  }
}
import { ID } from 'appwrite';

type Task = {
  id: string
  parentID: string
  deadline: Date
  urgency: Urgency
  priority: number
  scheduleType: ScheduleType
  duration: number
  canSplit: boolean
  isSplit: boolean
  isDone: boolean
  start: Date
  end: Date
}

type WorkHours = {
  start: number
  end: number
}

type DayHours = {
  start: number
  end: number
}

enum ScheduleType {
  WORK_HOURS,
  AFTER_WORK_HOURS,
  BEFORE_WORK_HOURS,
  NONE
}

enum Urgency {
  TODAY,
  TOMORROW,
  THIS_WEEK,
  NEXT_WEEK,
  FIXED,
  THIS_MONTH,
  NONE
}

type TimeSlot = {
  start: Date
  end: Date
}

const MIN_SPLIT_DURATION: number = 30 * 60 * 1000;

function schedule(workHours: WorkHours, dayHours: DayHours, tasks: Task[]): Task[] {
  const now: Date = new Date();

  // initialize the scheduled tasks with the fixed ones and filter out past ones
  const scheduledTasks: Task[] = tasks.filter(task => task.urgency === Urgency.FIXED && task.start >= now)
    .sort((a, b) => (a.start.getTime() - b.start.getTime()));

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

  while (unscheduledTasks.length > 0) {
    // get the current task
    const task: Task = unscheduledTasks.pop();

    // find the free time slots
    const freeTimeSlots: TimeSlot[] = findFreeTimeSlots(scheduledTasks);

    // schedule the current task and split it if necessary
    const [ scheduledTask, remainderTask, originalTask ]: Task[] = scheduleTask(workHours, dayHours, freeTimeSlots, task);

    // add the scheduled task to the scheduled tasks
    scheduledTasks.push(scheduledTask);
    if (originalTask) {
      scheduledTasks.push(originalTask);
    }

    // if there is a remainder, add it to the unscheduled tasks
    if (remainderTask) {
      unscheduledTasks.push(remainderTask);
    }
  }

  return scheduledTasks;
}


function findFreeTimeSlots(scheduledTasks: Task[]): TimeSlot[] {
  const freeTimeSlots: TimeSlot[] = [];
  let start: Date = new Date();
  let end: Date = null;
  start.setMinutes(Math.ceil(start.getMinutes() / 5) * 5);

  if (!scheduledTasks || scheduledTasks.length === 0) {
    return [{ start, end }];
  }

  scheduledTasks.forEach(({ start: tStart, end: tEnd }) => {
    if (tStart > start) {
      end = tStart;
      freeTimeSlots.push({ start, end });
      start = tEnd;
    }
  });

  freeTimeSlots.push({ start, end: null });

  return freeTimeSlots; 
}

// schedule the current task
// returns an array of two tasks: the scheduled one and the remainder
// if no splitting is necessary, the remainder is undefined
function scheduleTask(workHours: WorkHours, dayHours: DayHours, freeTimeSlots: TimeSlot[], task: Task): Task[] {
  const { deadline, duration, canSplit, scheduleType } = task;

  // @TODO: check if task can be scheduled
  // if can not be split and is longer than the maximum allowed duration
  // then save it as a task that can not be scheduled
  // (otherwise the while loop will run forever)

  for (let i = 0; i < freeTimeSlots.length; i++) {
    const slot = freeTimeSlots[i];
    const startOfDay = new Date(slot.start.getTime());
    startOfDay.setHours(0);
    const startBeforeWork: Date = new Date(startOfDay.getTime() + dayHours.start);
    const endBeforeWork: Date = new Date(startOfDay.getTime() + workHours.start);
    const startWork: Date = endBeforeWork;
    const endWork: Date = new Date(startOfDay.getTime() + workHours.end);
    const startAfterWork: Date = endWork;
    const endAfterWork: Date = new Date(startOfDay.getTime() + dayHours.end);
    
    let slotStart: Date = null;
    let slotEnd: Date = null;
    if (scheduleType === ScheduleType.WORK_HOURS) {
      slotStart = startWork > slot.start ? startWork : slot.start;
      slotEnd = endWork < slot.end ? endWork : slot.end;
    }
    if (scheduleType === ScheduleType.BEFORE_WORK_HOURS) {
      slotStart = startBeforeWork > slot.start ? startBeforeWork : slot.start;
      slotEnd = endBeforeWork < slot.end ? endBeforeWork : slot.end;
    }
    if (scheduleType === ScheduleType.AFTER_WORK_HOURS) {
      slotStart = startAfterWork > slot.start ? startAfterWork : slot.start;
      slotEnd = endAfterWork < slot.end ? endAfterWork : slot.end;
    }
    const slotDuration = slotEnd.getTime() - slotStart.getTime();

    if (duration <= slotDuration) {
      task.start = slotStart;
      task.end = new Date(slotStart.getTime() + duration);

      return [task, null, null];
    }

    if (canSplit && duration > slotDuration && slotDuration >= MIN_SPLIT_DURATION) {
      const newTask: Task = {
        ...task,
        id: ID.unique(),
        parentID: task.id,
        start: slotStart,
        end: slotEnd 
      };
      const remainderTask: Task = {
        ...task, id: ID.unique(),
        parentID: task.id,
        duration: duration - slotDuration,
        start: slotEnd,
        end: new Date(slotEnd.getTime() + (duration - slotDuration))
      };
      return [ newTask, remainderTask, task ];
    }
  }
}
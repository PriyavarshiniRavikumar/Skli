Skli Interview task
Question:
Schedule Task: POST /schedule-task
   Accept a taskName and executeAt (timestamp) to schedule the task.
    The task will be queued and executed after the executeAt time.
List Scheduled Tasks: GET /scheduled-tasks
       Retrieve all scheduled tasks and their status.
Cancel Task: DELETE /cancel-task/:taskId
      Cancel a specific scheduled task before its execution.

Work Done:
```
       1. Create DB in PGAdmin,add columns
       2. Create the Server
       3. Connect to the DB
       4. Add the end points
       5. Use timeout to change the status of the task.
```
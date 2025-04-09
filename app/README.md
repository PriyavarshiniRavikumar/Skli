Skli Interview task

Schedule Task: POST /schedule-task
   Accept a taskName and executeAt (timestamp) to schedule the task.
    The task will be queued and executed after the executeAt time.
List Scheduled Tasks: GET /scheduled-tasks
       Retrieve all scheduled tasks and their status.
Cancel Task: DELETE /cancel-task/:taskId
      Cancel a specific scheduled task before its execution.
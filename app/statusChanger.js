const pgClient=require('./config/pg-config')
const statusChanger = () => {
    setInterval(async () => {
        try {
            const now = new Date();
            console.log('now',now);
            const result = await pgClient.query(`
                SELECT * FROM schedule_tasks.tasks
                WHERE "status" ilike '%scheduled%'
            `);
            console.log("result",result)
            const updateStmt = `
                UPDATE schedule_tasks.tasks
                SET "status" = 'completed'
                WHERE "taskId" = $1
            `;

            for (const task of result.rows) {
                console.log("for loop")
                console.log('executeAt',task.executeAt);
    
                if (new Date(task.executeAt) <= now) {
                    console.log("inside if")
                console.log("id",task.taskId,task.taskName)

                    await pgClient.query(updateStmt, [task.taskId]);
                }
            }
        } catch (error) {
            console.error('Error', error);
        }
    }, 10000); 
};

module.exports = statusChanger;

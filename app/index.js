const express = require('express');

const app = express();
const config = require('./config/config');
const pgClient = require('./config/pg-config');
const body_parser = require('body-parser');

const jsonParser = body_parser.json();
app.use(jsonParser);


app.get('/scheduled-tasks', async (req, res) => {
    try {
        const queryStatement=`SELECT * FROM schedule_tasks.tasks where status='scheduled'`
        const result = await pgClient.query(queryStatement);
                res.status(200).json({
            tasks: result.rows,
        });
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/add-new-scheduled-task', async (req, res) => {
    // const { taskName, executeAt,status } = req.query;
    const { taskName, executeAt,status } = req.body;
    console.log( "before try",taskName, executeAt,status )

    try {
        console.log( taskName, executeAt,status )
        const values = [taskName, executeAt,status ];

        const queryStatement = `
            INSERT INTO schedule_tasks.tasks ("taskName", "executeAt", "status")
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const result = await pgClient.query(queryStatement, values);

        res.status(201).json({
            task: result.rows[0],
        });
    } catch (err) {
        console.error('Insert error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/completed-tasks', async (req, res) => {
    try {
        const now = new Date();
        console.log('now',now);
        
        const result = await pgClient.query(`
            SELECT * FROM schedule_tasks.tasks
            WHERE "status" ilike '%scheduled%'`
        );
console.log("result",result)
const updatestmt=` UPDATE schedule_tasks.tasks
                    SET "status" = 'completed'
                    WHERE "taskId" = $1`;
        for (const task of result.rows) {
            console.log("for loop")
            console.log('executeAt',task.executeAt);
            
            if (new Date(task.executeAt) <= now) {
                console.log("inside if")
                console.log("id",task.taskId,task.taskName)
                await pgClient.query(updatestmt
                , [task.taskId]);
            }
        }

        const updatedResult = await pgClient.query(`
            SELECT * FROM schedule_tasks.tasks
            WHERE "status"' = 'completed'`
        );

        res.status(200).json({ tasks: updatedResult.rows });
    } catch (err) {
        console.error('Error fetching scheduled tasks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.delete('/cancel-task/:taskId',async(req,res)=>{
    try{
        const taskid=req.params.taskId;
    console.log('taskid',taskid);
    const deleteStmt=`DELETE FROM schedule_tasks.tasks WHERE "taskId"=$1`;
     const ansStmt=`SELECT * FROM schedule_tasks.tasks
            WHERE "taskId" = $1`;
    const ansRes=await pgClient.query(ansStmt,[taskid])
    console.log('ansRes',ansRes)
    const deleteRes = await pgClient.query(deleteStmt,[taskid]);
    console.log('deleteRes',deleteRes)
    res.status(200).json({
        tasks:ansRes.rows,
    })

    }
    catch(error){
        console.error('Error fetching scheduled tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
app.listen(3000,"localhost", () => {
    console.log(`Server running at http://localhost:3000/`);
});
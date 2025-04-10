const express = require('express');

const app = express();
const config = require('./config/config');
const pgClient = require('./config/pg-config');
const body_parser = require('body-parser');
const statusChanger= require('./statusChanger')
const jsonParser = body_parser.json();
app.use(jsonParser);


app.get('/scheduled-tasks', async (req, res) => {
    try {
        const queryStatement=`SELECT * FROM schedule_tasks.tasks where status='scheduled'`
        const result = await pgClient.query(queryStatement);
        if(result.rowCount==0){
            res.status(200).send("All tasks are completed")
        }
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
        
        const result = await pgClient.query(`
            SELECT * FROM schedule_tasks.tasks
            WHERE "status" ilike '%completed%'`
        );
console.log("result",result)
if(result.rowCount==0){
    res.status(200).send("No completed tasks")
}else{
    res.status(200).json({
        message:`${result.rowCount} tasks are completed`,
        tasks: result.rows,
    });
}
       
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
    statusChanger();
});

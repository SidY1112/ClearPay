const pool = require('./db/connect.js');
const express = require('express'); // Importing the express package and storing the function into 'express'
const app = express(); // Calling that function which creates an instance of the app
app.use(express.json()); // express.json is what allows us to parse data in json format and were telling our app to use this
app.use('/api/expenses', require('./routes/expenses.js'))
app.use('/api/payroll', require('./routes/payroll.js'))


app.get('/api/test', async(req, res) => 
  {
  try {
    const result = await pool.query('SELECT NOW()'); 
    res.json({ time: result.rows[0].now });
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
);

app.listen(process.env.PORT, () => {

  console.log(`Server is running on port ${process.env.PORT}`);

})
const express = require('express');
const pool = require('../db/connect.js');
const router = express.Router();
const { body, validationResult } = require('express-validator');


router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Payroll');
    res.json(result.rows); // returns all Payroll
  } catch (error) {
    console.error('Error fetching Payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/:id', async(req,res) => {
  const id = req.params.id
  try{
    const query = `SELECT * FROM Payroll
             WHERE user_id = $1;`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll not found' });
    }
    res.json(result.rows[0]);
  }catch(error){
    console.error('Error fetching Payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async(req,res) => {
  const id = req.params.id
  try{
    const query = `SELECT * FROM Payroll
             WHERE payroll_id = $1;`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll not found' });
    }
    res.json(result.rows[0]);
  }catch(error){
    console.error('Error fetching Payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', [
  body('status').notEmpty().withMessage('Status is required'),
  body('user_id').isInt().withMessage('User ID must be an integer'),
  body('Payroll_type').notEmpty().withMessage('Payroll type is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isFloat().withMessage('Amount must be a number')
],
async (req, res) => {
    const errors = validationResult(req); // Looking through the request object and cross checking with the body validators, store anything found in errors
    if (!errors.isEmpty()) {              // If its empty then it's all good if errors is not empty then display that error and stop the request immeiditly
      return res.status(400).json({ errors: errors.array() });
    }

  const { status, user_id, Payroll_type, description, amount } = req.body;

  try {
    // Destructure values from the request body

    // SQL query string with parameterized values to prevent SQL injection
    const query = `
      INSERT INTO Payroll (status, user_id, Payroll_type, description, amount)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    // Execute the query and pass in the corresponding values
    const result = await pool.query(query, [status, user_id, Payroll_type, description, amount]);

    // Send back the newly inserted row
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting new Payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', [
  body('status').optional().notEmpty().withMessage('Status cannot be empty'),
  body('Payroll_type').optional().notEmpty().withMessage('Payroll type cannot be empty'),
  body('description').optional().isLength({ max: 255 }).withMessage('Description too long'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
],async (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const errors = validationResult(req); // Looking through the request object and cross checking with the body validators, store anything found in errors
    if (!errors.isEmpty()) {              // If its empty then it's all good if errors is not empty then display that error and stop the request immeiditly
      return res.status(400).json({ errors: errors.array() });
    }

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'No fields provided for update' });
  }

  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  const query = `
    UPDATE Payroll
    SET ${setClauses.join(', ')}
    WHERE payroll_id = $${paramIndex}
    RETURNING *;
  `;
  values.push(id); // Add id as the last parameter

  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating Payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', async(req,res)=>{
  const id = req.params.id;
  try{
    const query = `DELETE FROM Payroll WHERE payroll_id = $1
                   RETURNING *;`
    
    const result = await pool.query(query, [id]);
    res.sendStatus(204);



  } catch(error){
    console.error('Error deleting Payroll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
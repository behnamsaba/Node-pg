const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


router.get('/', async (req,res,next) => {
    try{
        const results = await db.query('SELECT * FROM invoices');
        return res.json( { invoices: results.rows });
    }catch(e){
        return next(e);
    }
});


router.get('/:id', async (req,res,next) => {
    try{
        const { id } = req.params;
        const result = await db.query(`SELECT * FROM invoices WHERE id=$1`,[id]);
        if(result.rows.length === 0){
            throw new ExpressError('Not Found', 404);
        }
        return res.json({ invoice : result.rows[0] })
    }catch(e){
        return next(e);
    }
})

router.post('/', async (req,res,next) => {
    try{
        const { comp_code , amt } = req.body;
        const result = await db.query('INSERT INTO invoices (comp_code,amt) VALUES ($1,$2) RETURNING *',[comp_code,amt]);
        return res.status(201).json({ invoice: result.rows[0]} );
    }catch(e){
        return next(e)
    }
})

router.put('/:id', async (req,res,next) => {
    try{
        const { amt , paid } = req.body;
        let paidDate = null;
        const findData = await db.query('SELECT * FROM invoices WHERE id=$1',[req.params.id]);
        if(findData.rows.length === 0){
            throw new ExpressError('Not Found', 404);
        }
        const currPaidDate = findData.rows[0].paid_date;

        if (!currPaidDate && paid) {
          paidDate = new Date();
        } else if (!paid) {
          paidDate = null
        } else {
          paidDate = currPaidDate;
        }
    
        const result = await db.query(
              `UPDATE invoices
               SET amt=$1, paid=$2, paid_date=$3
               WHERE id=$4
               RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]);
    
        return res.json({"invoice": result.rows[0]});
    }catch(e){
        return next(e);
    }
})

router.delete('/:id', async (req,res,next) => {
    try{
        const result = await db.query('DELETE FROM invoices WHERE id=$1',[req.params.id]);
        if(result.rows.length === 0){
            throw new ExpressError('Not Found', 404);
        }
        return res.json({message:"Deleted"})
    }catch(e){
        return next(e);
    }
})
module.exports =  router;
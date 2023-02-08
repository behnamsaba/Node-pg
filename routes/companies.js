const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const { query } = require("express");

router.get('/',async (req,res,next) => {
    try{
        const results =await db.query('SELECT * FROM companies');
        return res.json( { companies: results.rows });
    }catch(e){
        next(e);
    }
})

router.get('/:code',async (req,res,next) => {
    try{
        const { code } = req.params
        const result = await db.query(`SELECT * FROM companies WHERE code=$1`,[code]);
        if(result.rows.length === 0){
            throw new ExpressError('Not Found', 404)
        }
        return res.json({ company : result.rows[0] });

    }catch(e){
        return next(e);
    }
})

router.post('/',async (req,res,next) => {
    try{
        const {code , name , description} = req.body;
        const result = await db.query('INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING *',
        [code,name,description]);
        return res.status(201).json(result.rows);

    }catch(e){
        return next(e);
    }
})

router.patch('/:code',async (req,res,next) => {
    try{
        const {name , description} = req.body;
        const result = await db.query('UPDATE companies SET name=$1,description=$2 WHERE code=$3 RETURNING *',
        [name,description,req.params.code]);
        
        if (result.rows.length === 0) {
            throw new ExpressError(`There is no company with code of '${req.params.code}`, 404);
        }
        
        return res.json(result.rows[0]);
    }catch(e){
        return next(e)
    }
})

router.delete('/:code', async (req,res,next) => {
    try{
        const { code } = req.params
        const result = await db.query('DELETE FROM companies WHERE code=$1',[code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`There is no comapny with code of '${req.params.code}`, 404);
          }
        return res.json({ message: "Company deleted" });
    }catch(e){
        return next(e)
    }
})


module.exports = router;
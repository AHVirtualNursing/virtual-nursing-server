const express = require('express');
const router = express.Router();
const Ward = require('../models/ward');

router.get('/', async (req, res) => {
    try {
      const wards = await Ward.find({});
      res.status(200).json({ success: true, data: wards });
    } catch (e) {
      res.status(500).json({message: e.message});
    }
  })

router.get('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const ward = await Ward.findById(id);
        if (!report) {
            return res.status(404).json({message: `cannot find any ward with ID ${id}`})
        }
        res.status(200).json(ward);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})

router.post('/', async (req, res) => {
    try {
      const newWard = await Ward.create(req.body);
      res.status(200).json({ success: true, data: newWard });
    } catch (e) {
      if (e.name === 'ValidationError') {
          const validationErrors = Object.values(e.errors).map((e) => e.message);
          return res.status(400).json({validationErrors});
      } else {
        res.status(500).json({message: e.message});
      }
    }
})

router.put('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const ward = await Ward.findOneAndUpdate(
            {_id: id},
            req.body,
            {new: true, runValidators: true}
        );
        if (!ward) {
            return res.status(404).json({message: `cannot find any ward with ID ${id}`})
        }
        const updatedWard = await Ward.findById(id);
        res.status(200).json(updatedWard);
    } catch (e) {
        if (e.name === 'ValidationError') {
            const validationErrors = Object.values(e.errors).map((e) => e.message);
            return res.status(400).json({validationErrors});
        } else {
            res.status(500).json({message: e.message}); 
        }
    }
})

router.delete('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const ward = await Ward.findByIdAndDelete(id);
        if (!ward) {
            return res.status(404).json({message: `cannot find any ward with ID ${id}`})
        }
        res.status(200).json(alert);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})

module.exports = router;
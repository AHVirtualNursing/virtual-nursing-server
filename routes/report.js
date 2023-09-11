const express = require('express');
const router = express.Router();
const Report = require('../models/report')

router.get('/', async (req, res) => {
    try {
      const reports = await Report.find({});
      res.status(200).json({ success: true, data: reports });
    } catch (e) {
      res.status(500).json({message: e.message});
    }
  })

router.get('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({message: `cannot find any report with ID ${id}`})
        }
        res.status(200).json(report);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})

router.post('/', async (req, res) => {
    try {
      const newReport = await Report.create(req.body);
      res.status(200).json({ success: true, data: newReport });
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
        const report = await Report.findOneAndUpdate(
            {_id: id},
            req.body,
            {new: true, runValidators: true}
        );
        if (!report) {
            return res.status(404).json({message: `cannot find any report with ID ${id}`})
        }
        const updatedReport = await Report.findById(id);
        res.status(200).json(updatedReport);
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
        const report = await Reminder.findByIdAndDelete(id);
        if (!report) {
            return res.status(404).json({message: `cannot find any report with ID ${id}`})
        }
        res.status(200).json(alert);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})

module.exports = router;
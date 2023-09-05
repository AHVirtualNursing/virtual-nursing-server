const express = require('express');
const router = express.Router();
const Alert = require('../models/alert');

router.get('/', async (req, res) => {
    try {
      const alerts = await Alert.find({});
      res.status(200).json({ success: true, data: alerts });
    } catch (e) {
      res.status(400).json({ success: false });
    }
  });

router.get('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const alert = await Alert.findById(id);
        if (!alert) {
            return res.status(404).json({message: `cannot find any alert with ID ${id}`})
        }
        res.status(200).json(alert);
    } catch (e) {
        res.status(400).json({ success: false });
    }
})

router.post('/', async (req, res) => {
  try {
    const newAlert = await Alert.create(req.body);
    res.status(200).json({ success: true, data: newAlert });
  } catch (e) {
    if (e.name === 'ValidationError') {
        const validationErrors = Object.values(e.errors).map((e) => e.message);
        return res.status(400).json({validationErrors});
    } else {
        res.status(400).json({ success: false }); 
    }
  }
});

router.put('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const alert = await Alert.findOneAndUpdate(
            {_id: id},
            req.body,
            {new: true, runValidators: true}
        );
        if (!alert) {
            return res.status(404).json({message: `cannot find any alert with ID ${id}`})
        }
        const updatedAlert = await Alert.findById(id);
        res.status(200).json(updatedAlert);
    } catch (e) {
        if (e.name === 'ValidationError') {
            const validationErrors = Object.values(e.errors).map((e) => e.message);
            return res.status(400).json({validationErrors});
        } else {
            res.status(400).json({ success: false }); 
        }
    }
})

router.delete('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const alert = await Alert.findByIdAndDelete(id);
        if (!alert) {
            return res.status(404).json({message: `cannot find any alert with ID ${id}`})
        }
        res.status(200).json(alert);
    } catch (e) {
        res.status(400).json({ success: false }); 
    }
})

module.exports = router;
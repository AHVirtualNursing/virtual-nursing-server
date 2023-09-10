const express = require('express');
const router = express.Router();
const Vital = require('../models/vital');

router.get('/', async (req, res) => {
    try {
      const vital = await Vital.find({});
      res.status(200).json({ success: true, data: vital });
    } catch (e) {
      res.status(400).json({ success: false });
    }
  });

router.get('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const vital = await Vital.findById(id);
        if (!vital) {
            return res.status(404).json({message: `cannot find any vital with ID ${id}`})
        }
        res.status(200).json(vital);
    } catch (e) {
        res.status(400).json({ success: false });
    }
})

router.post('/', async (req, res) => {
  try {
    const newVital = await Vital.create(req.body);
    res.status(200).json({ success: true, data: newVital });
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
        const vital = await Vital.findOneAndUpdate(
            {_id: id},
            req.body,
            {new: true, runValidators: true}
        );
        if (!vital) {
            return res.status(404).json({message: `cannot find any vital with ID ${id}`})
        }
        const updatedVital = await Vital.findById(id);
        res.status(200).json(updatedVital);
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
        const vital = await Vital.findByIdAndDelete(id);
        if (!vital) {
            return res.status(404).json({message: `cannot find any vital with ID ${id}`})
        }
        res.status(200).json(vital);
    } catch (e) {
        res.status(400).json({ success: false }); 
    }
})

module.exports = router;
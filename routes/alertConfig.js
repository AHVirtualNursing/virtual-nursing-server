const express = require('express');
const router = express.Router();
const AlertConfig = require('../models/alertConfig');

router.get('/', async (req, res) => {
    try {
      const alertConfigs = await AlertConfig.find({});
      res.status(200).json({ success: true, data: alertConfigs });
    } catch (e) {
      res.status(400).json({ success: false });
    }
  });

router.get('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const alertConfig = await AlertConfig.findById(id);
        if (!alertConfig) {
            return res.status(404).json({message: `cannot find any alertConfig with ID ${id}`})
        }
        res.status(200).json(alertConfig);
    } catch (e) {
        res.status(400).json({ success: false });
    }
})

router.post('/', async (req, res) => {
  try {
    const newAlertConfig = await AlertConfig.create(req.body);
    res.status(200).json({ success: true, data: newAlertConfig });
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
        const alertConfig = await AlertConfig.findOneAndUpdate(
            {_id: id},
            req.body,
            {new: true, runValidators: true}
        );
        if (!alertConfig) {
            return res.status(404).json({message: `cannot find any alertConfig with ID ${id}`})
        }
        const updatedAlertConfig = await AlertConfig.findById(id);
        res.status(200).json(updatedAlertConfig);
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
        const alertConfig = await AlertConfig.findByIdAndDelete(id);
        if (!alertConfig) {
            return res.status(404).json({message: `cannot find any alertConfig with ID ${id}`})
        }
        res.status(200).json(alertConfig);
    } catch (e) {
        res.status(400).json({ success: false }); 
    }
})

module.exports = router;
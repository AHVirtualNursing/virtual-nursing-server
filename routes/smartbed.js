const express = require('express');
const router = express.Router();
const Smartbed = require('../models/smartbed');

router.get('/', async (req, res) => {
    try {
      const smartbeds = await Smartbed.find({});
      res.status(200).json({ success: true, data: smartbeds });
    } catch (e) {
      res.status(400).json({ success: false });
    }
  });

router.get('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const smartbed = await Smartbed.findById(id);
        if (!smartbed) {
            return res.status(404).json({message: `cannot find any smartbed with ID ${id}`})
        }
        res.status(200).json(smartbed);
    } catch (e) {
        res.status(400).json({ success: false });
    }
})

router.post('/', async (req, res) => {
  try {
    const newSmartbed = await Smartbed.create(req.body);
    res.status(200).json({ success: true, data: newSmartbed });
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
        const smartbed = await Smartbed.findOneAndUpdate(
            {_id: id},
            req.body,
            {new: true, runValidators: true}
        );
        if (!smartbed) {
            return res.status(404).json({message: `cannot find any smartbed with ID ${id}`})
        }
        const updatedSmartbed = await Smartbed.findById(id);
        res.status(200).json(updatedSmartbed);
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
        const smartbed = await Smartbed.findByIdAndDelete(id);
        if (!smartbed) {
            return res.status(404).json({message: `cannot find any smartbed with ID ${id}`})
        }
        res.status(200).json(smartbed);
    } catch (e) {
        res.status(400).json({ success: false }); 
    }
})

module.exports = router;
const express = require('express');
const router = express.Router();
const Smartbed = require('../models/smartbed');

router.get('/', async (req, res) => {
    console.log('1')
    try {
      const smartbeds = await Smartbed.find({});
      res.status(200).json({ success: true, data: smartbeds });
    } catch (e) {
      res.status(400).json({ success: false });
    }
  });

router.get('/bed/:id', async(req, res) => {
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

router.get('/beds', async (req, res) => {
    const idsToRetrieve = req.query.ids.split(',');
    
    try {
        const smartBeds = await Promise.all(idsToRetrieve.map(async (id) => {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const smartBed = await Smartbed.findById(id).populate("patient ward");
                console.log(smartBed)
                if (!smartBed) {
                    res.status(404).json({message: `cannot find any smartbed with ID ${id}`})
                }
                console.log(smartBed['bedNum'])
                return smartBed;
            } else{
                res.status(500).json({ message: `${id} is in wrong format`});
            }}));
        res.status(200).json(smartBeds);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

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
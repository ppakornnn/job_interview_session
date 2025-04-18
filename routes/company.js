const express = require('express');
const {getCompanys, getCompany, createCompany, updateCompany, deleteCompany} = require('../controllers/companys');
const {protect, authorize} = require('../middleware/auth');

//Include other resource routers
const appointmentRouter=require('./appointments');

const router = express.Router();

//Re-route into other resource routers
router.use('/:hospitalId/appointments/', appointmentRouter);

router.route('/').get(getCompanys).post(protect, authorize('admin'), createCompany);
router.route('/:id').get(getCompany).put(protect, authorize('admin'), updateCompany).delete(protect, authorize('admin'), deleteCompany);

module.exports=router;

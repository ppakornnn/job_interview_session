const express = require('express');
const {getCompanys, getCompany, createCompany, updateCompany, deleteCompany} = require('../controllers/companys');

//Include other resource routers
const appointmentRouter=require('./appointments');

const router = express.Router();

//Re-route into other resource routers
router.use('/:hospitalId/appointments/', appointmentRouter);

router.route('/').get(getCompanys).post(createCompany);
router.route('/:id').get(getCompany).put(updateCompany).delete(deleteCompany);

module.exports=router;
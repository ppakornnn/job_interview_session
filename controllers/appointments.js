const Appointment = require('../models/Appointment');
const updateCompany = require('../models/Company');

//@desc     Get all appointments
//@route    GET /api/v1/appointments
//@access   Public
exports.getAppointments=async (req,res,next)=>{
    let query;
    //General users can see only their appointments!
    if(req.user.role !== 'admin'){
        query=Appointment.find({user:req.user.id}).populate({
            path:'company',
            select:'name province tel'
        });
    }else{ //If you are an admin, you can see all!
        
        if (req.params.companyId) {
            console.log(req.params.companyId);
        
        query=Appointment.find().populate({
            path:'company',
            select:'name province tel'
        });
    } else query = Appointment.find();
}
    try {
        const appointments= await query;

        res.status(200).json({
            success:true,
            count:appointments.length,
            data: appointments
        });
    } catch(error) {
        console.log(error.stack);
        return res.status(500).json({success:false, message: "Cannot find Appointment"});
    }
}

//@desc     Get single appointments
//@route    GET /api/v1/appointment/:id
//@access   Public
exports.getAppointment=async (req,res,next)=>{
    try {
        const appointment= await Appointment.findById(req.params.id).populate({
            path: 'company',
            select: 'name province tel'
        });
        if(!appointment){  
            return res.status(400).json({success:false, message: `No appointment with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success:true,
            data: appointment
    });
    } catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message: "Cannot find Appointment"});
    }
};

//@desc     Add appointments
//@route    POST /api/v1/companys/:companyId/appointments
//@access   Private
exports.addAppointment=async (req,res,next)=>{
    try {
        req.body.Company=req.params.companyId;
        
        const company= await Company.findById(req.params.companyId);
        if(!company){
            return res.status(404).json({success:false, message: `No company with the id of ${req.params.companyId}`});
        }
        console.log(req.body);

        //add user Id to req.body
        req.body.user=req.user.id;
        const existingAppointments=await Appointment.findOne({user:req.user.id});
        if(existingAppointments.length >=3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false, message: `The user with ID ${req.user.id} has already 3 appointments`});
        }

        const appointment = await Appointment.create(req.body);
        res.status(200).json({
            success:true,
            data: appointment
        });
    }catch(error) {
        console.log(error);
        return res.status(500).json({success:false, message: "Cannot add Appointment"});
    }};

//@desc     Update appointments
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment=async (req,res,next)=>{
    try{
        let appointment = await Appointment.findById(req.params.id);
        if(!appointment){
            return res.status(404).json({success:false, message: `No appointment with the id of ${req.params.id}`});
        }
        //Make sure user is appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, message: `User ${req.user.id} is not authorized to update this appointment`});
        }
        appointment=await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new:true,
            data: appointment
        });
    }catch(err){
        console.log(err.stack);
        return res.status(400).json({success:false, message: "Cannot update Appointment"});
    }
}

//@desc     Delete appointments
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment=async (req,res,next)=>{
    try{
        const appointment = await Appointment.findById(req.params.id);
        if(!appointment){
            return res.status(404).json({success:false, message: `No appointment with the id of ${req.params.id}`});
        }
        await appointment.remove();

        res.status(200).json({success:true, data:{}});
    }catch(err){
        console.log(err.stack);
        return res.status(400).json({success:false, message: "Cannot delete Appointment"});
    }
}

const Company = require('../models/Company.js');

//@desc     Get all companys
//@route    GET /api/v1/companys
//@access   Public
exports.getCompanys=async (req,res,next) => {
        let query;

        //Copy req.query
        const reqQuery = {...req.query}; // ... -> Explode query str -> Array Key,Value

        //Fields to Exclude
        const removeFields=['select','sort','page','limit'];

        //Loop over remove fields and delete them from reqQuery
        removeFields.forEach(param=>delete reqQuery[param]);
        console.log(reqQuery);

        // Crate Query String
        let queryStr=JSON.stringify(reqQuery);
        //Create Operators ($gt, $gte, etc)
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

        //finding resource
        query=Company.find(JSON.parse(queryStr)).populate('appointments');

        //Select Fields
        if(req.query.select){
            const fields=req.query.select.split(',').join(' ');
            query=query.select(fields);
        }
        //Sort
        if(req.query.sort){
            const sortBy=req.query.sort.split(',').join(' ');
            query=query.sort(sortBy);
        } else{
            query=query.sort('-createdAt');
        }
        //Pagination
        const page=parseInt(req.query.page,10) || 1;
        const limit=parseInt(req.query.limit,10)||25;
        const startIndex=(page-1)*limit;
        const endIndex=page*limit;
        const total=await Company.countDocuments();

        query=query.skip(startIndex).limit(limit);

        //Executing query
        try {
        const companys = await query;
        //Pagination Result
        const pagination ={};

        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }
        console.log(req.query);

        res.status(200).json({success:true,count:companys.length,pagination, data:companys});
    } catch(err){
        res.status(400).json({success:false});
    }

}


//@desc     Get single company
//@route    GET /api/v1/company/:id
//@access   Public
exports.getcompany=async (req,res,next) => {
    try{
        const company = await Company.findById(req.params.id);

        if(!company){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:company});
    } catch(err){
        res.status(400).json({success:false})
    }
};

//@desc     Create new companys
//@route    PUT /api/v1/companys
//@access   Private
exports.createCompany = async (req,res,next) => {
    const company = await Company.create(req.body);
    res.status(201).json({success:true, data:company});
};

//@desc     Update Companys
//@route    POST /api/v1/companys/:id
//@access   Private
exports.updateCompany= async (req,res,next) => {
    try{
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators:true
        });
        
        if(!company){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true, data: company});
    }catch(err){
        res.status(400).json({success:false});
    }
};

//@desc     Delete Companys
//@route    DELETE /api/v1/companys/:id
//@access   Private
exports.deleteCompany=async (req,res,next) => {
    try{
        const company = await Company.findById(req.params.id);

        if(!company){
            return res.atus(404).json({success:false, message:`Company not found with id of ${req.params.id}`});
        }
        await Company.deleteOne({_id:req.params.id});
        res.status(200).json({success:true, data: {}});
    }catch(err){
        res.status(400).json({success:false});
    }
};

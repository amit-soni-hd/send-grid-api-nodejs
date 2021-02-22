
import { NextFunction, Request, Response } from 'express';
import service from '../service/SendMailService';

const serverHealthCheck = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        message: 'pong',
    });
};

const sendmail = async (req: Request, res: Response, next: NextFunction) => {
    var status = await service.sendMail(req.body)
    var successList = []
    var failList = []
   
    for (const [key, value] of status.entries()) {
        if(value == "pass")
            successList.push(key)
        else
            failList.push(key)
    }
    return res.status(200).json({
        status: 200,
        message: 'Send email by send grid api',
        data : {
            success: successList,
            failure: failList
        }
    });
};

export default { serverHealthCheck, sendmail };
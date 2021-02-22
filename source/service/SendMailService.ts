// using Twilio SendGrid's v3 Node.js Library
import { TSMap } from "typescript-map"
import  sgMail from '@sendgrid/mail'
import fs from 'fs'


var key = process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY : "" 
sgMail.setApiKey(key)



// take the mail request and remove dublite and send to user
const sendMail = (reqBody: any)  => { 
    let uniqueData = new TSMap<string,any>();
    let userData = reqBody["userData"];
    let emailMessage = reqBody["emailMessage"];
    let attachements = reqBody["attachements"];

    uniqueData = uniqueDublicateEmail(userData) 
    var status = message(uniqueData,emailMessage,attachements)
    return status
}

// create a full message and send
const message = async (usersData: TSMap<string,any>, emailMessage: any, attachements: any) => {
    
    var status = new TSMap<string,string>()
    let listOfCcMail = []
    let listOfBccMail = []
    let listOfTo = []

    // generate the personlization message 
    for (const [key, value] of usersData.entries()) {
        if(value.type == "to") 
            listOfTo.push(value.email)
        else if(value.type == "bcc" ) 
            listOfBccMail.push(value.email)
        else if(value.type == "cc")
            listOfCcMail.push(value.email) 
    }
    // console.log(listOfTo)
    let attachmentList = attachemntList(attachements)
    
    for (const user of listOfTo) {
        // build the message
        const msg = {
            to: user, // recipent 
            bcc: listOfBccMail, // blind carbon copy
            cc: listOfCcMail, // carbon copy
            from: 'verma1910amit@gmail.com', // sender user
            subject: 'Your result has been declared',
            text: "Hi " + usersData.get(user).name + ", your result status is " + usersData.get(user).status + ".",
            html: "Hi " + usersData.get(user).name + ", <b>your result status is " + usersData.get(user).status + ".</b>",
            attachments: attachmentList
        }
        var result = send(msg)
        console.log(result)
        if(await result == "pass")
            status.set(user, "pass")
        else    
            status.set(user,"fail")
        
    }
    return status
}

//get attachment list 

let attachemntList = (attachements: any) => {
    let listOfAttachment = []
    for (const attatch of attachements) {
        let pathToAttachment = attatch.path
        try {
            let attachment = fs.readFileSync(pathToAttachment).toString("base64");
            let data = {
                content: attachment,
                filename: attatch.filename,
                disposition: "attachment"
            }
            listOfAttachment.push(data)
        } catch(err) {
            console.error(err)
        } 
    }
    return listOfAttachment
}
// remove the dublicate mail
let uniqueDublicateEmail = (userData: any) => {
    var map = new TSMap<string,any>();
    for (const entity of userData) {
        if(map.has(entity.email)) {
            var newPriority = priority(entity.type)
            var oldPriority = priority(map.get(entity.email).type);
            if(newPriority > oldPriority) 
                map.set(entity.email, entity)
        } else {
            map.set(entity.email, entity)
        }
    }
    return map
}

// get the priority of type
let priority = (type: string) => {
    if(type == "to")
        return 3
    else if(type == "cc")
        return 2
    else    
        return 1
}

let send = async (msg: any) => {
    try {
        const res = await sgMail.send(msg);
        console.log(res[0].statusCode)
        if(res[0].statusCode.toString()[0] == '2')
            return "pass"
    } catch(error) {
        console.error(error);
        return "fail"
    }
    return "fail"
}

export default { sendMail };
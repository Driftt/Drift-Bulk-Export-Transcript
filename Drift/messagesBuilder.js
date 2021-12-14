//This funcstion is options if you prefer to collect detailed message object than just a transcript as in getTranscript.js
const he = require('he'); //formats html encoded text to human readable - https://www.npmjs.com/package/he

const messagesBuilder = (agents, contactAttributes, messages) => {

  let convoMessages = [];
  let msgArray = messages.data.messages;
  let tags = {};
  
  for (let i= 0; i<msgArray.length; i++){
    let body = msgArray[i].body  || "";

    let type = typeSetter(msgArray[i]);
    let author = authorSetter(msgArray[i], type, contactAttributes, agents);
    convoMessages.push({
      body: he.decode(body),
      type: type,
      added_at: new Date(msgArray[i].createdAt).toISOString().slice(0,-5)+"Z",
      author_id: author
    })

    //gather any convo tags
    // if(type == 'internal_note'){
    //   tags = parser.tagParser(body);
    // }
  }

  //if multiple values are assigned to a top level tagDropper tag, only the last value will be returned
  return {"comments": convoMessages,
          //"tags": tags
        };
}

const authorSetter = (msg, type, attributes, agents) => {
  try {
    if (Object.keys(agents).length == 0){
      return "Unknown (Agent Lookup Error)";
    }
        
    if (type == "customer_comment"){
      let contactEmail = "Unknown Visitor";
      try{
        if(attributes.email){
          contactEmail = attributes.email;
        }
      } catch (error){
        console.log("No contact data for convoId: "+ msg.id);
      }

      return contactEmail + " (Site Visitor)";
    } else if (type == "internal_note" || type == "agent_comment"){

      let authorName = "Unknown";
      if (agents[msg.author.id]){
        if(agents[msg.author.id].name){
          authorName = agents[msg.author.id].name;
        } else if (agents[msg.author.id].email){
          authorName = agents[msg.author.id].email;
        }
      } 
      return authorName + " (Agent)";
    }
    
  } catch (error) {
    console.log("Error assigning message author for message id: "+msg.id);
    console.log(error);
    return "Unknown Author";
  }
}

const typeSetter = (msg) =>{
  let convoType = 'customer_comment';

  if (msg.type == 'private_note'){
    convoType = 'internal_note';
  } else if (msg.author.type == 'user') {
    convoType = 'agent_comment';
  } 
  return convoType;
}

module.exports = messagesBuilder;
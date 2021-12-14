// Main app.js will loop through all the pages of the list conversations endpoint with a certain time range to obtain all the conversation ID's. 
//Then loop a job that retrieves each individual conversation, related chat agent, attributes, transcript.
//You can grab the conversation object as a JSON or download the transcript as a string.


require("dotenv").config();
const DRIFT_AUTH_TOKEN = process.env.DRIFT_AUTH_TOKEN; // oAuth token generated when creating an app within dev.drift.com
const convoReporter = require("./Drift/listConvoIds"); // Hit report endpoint to collect conversationId
const getConvo = require("./Drift/getConversation"); // Hit conversation endpoint to get more detailed information about a particular conversation.
const getScript = require("./Drift/getTranscript"); // The response object will be a formatted string of the entire transcript
const getChatAgents = require("./Drift/getChatAgents.js"); //To list users in your org
const csvCreate = require("./CSVWriter/csvCreate.js"); // Writes objects/arrays into a CSV string into a file
const messagesBuilder = require("./Drift/messagesBuilder.js"); // Optional to include for detailed messages in conversation
const getAttributes = require("./Drift/getContactAttributes.js"); // Retrieve Contacts' attributes
const participants = require("./Drift/getParticipants.js"); // Retrieve participants
const getConvoMessages = require("./Drift/getMessages"); // Optional to retrieve messages for conversation id rather than transcripts

// Count for total time it took to execute
console.time();

(async () => {
  let convoList = await convoReporter.convoReport(); //return list of conversation Ids

  // Handle error due to no new conversation captured within a specific timeline
  if (convoList == "no new conversations") {
    console.log("No new conversations to add.");
    return;
  } else if (convoList == "Error retrieving conversations.") {
    console.log("Error retrieving conversations.");
    return;
  }

  const chatAgents = await getChatAgents(); //retrieve a hash of ALL Chat Agents in this org

  let convosArray = [];

  // Loop through the conversation list to store conversation objects/transcripts
  for (const convoId of convoList) {
    const convoObject = await getConvo.getConversation(convoId.conversationId);
    const transcriptObject = await getScript.getTranscript(convoId.conversationId);


    if (convoObject !== "Error") {

      const contactAttributes = await getAttributes(convoObject.data.contactId); // Calls drift contact API to get attributes
 
      const driftMessages = await getConvoMessages(convoId.conversationId); // Optional to retrieve messages for conversation id rather than transcripts

      const conversationTranscript = transcriptObject // Store transcript object

      // Messages Builder if transcript is not enough
      const convoMessages = messagesBuilder(
        chatAgents,
        contactAttributes,
        driftMessages,
        conversationTranscript
      ); 

        // Collects employment_name attribute values
      const companyName = contactAttributes.employment_name || "null";

      //Returns list of participants of the conversation object
      const convoParticipants = participants.getParticipants(
        convoObject,
        chatAgents
      );

      //Fields that will be added to the CSV file
      let convoBase = {
        convo_id: convoId.conversationId.toString(), // conversation ID
        assignee_id: convoParticipants[0], //This locate the the first agent to join the conversation
        link_to_full_conversation:"https://app.drift.com/conversations/" + convoId.conversationId, // conversation link in app.drift.com
        company_name: companyName, //employment_name attribute values
        updatedat_date:new Date(convoObject.data.updatedAt).toISOString().slice(0, -5) + "Z", // Stores updatedat_date
        createdat_date:new Date(convoObject.data.createdAt).toISOString().slice(0, -5) + "Z", // Stores createdat_date
        status: convoObject.data.status, // Conversation's Status
        participant: convoParticipants.join(", "), // Converation's participant
        total_messages: convoId.metrics.slice(4, 7).reduce((a, b) => a + b), // Total messages in conversation
        num_agent_messages: convoId.metrics[4], // Stores num_agent_messages
        num_bot_messages: convoId.metrics[5], // Stores num_bot_messages
        num_end_user_messages: convoId.metrics[6], // Stores num_end_user_messages
        comments: convoMessages.comments, // Stores in internal comments
        transcriptObject: conversationTranscript // Stores transcriptObject
      };

      // Combines conversations data + tags 
      let convo = { ...convoBase, ...convoMessages.tags };
      console.log("convo id " + convo.convo_id + " created.");
      convosArray.push(convo);
    }
  }

  console.log(`Total convos to send to CSV File: ${convosArray.length}`);

  //submit convos-create-bulk job in batches of 100 convos - It can be modified to lower or higher number of total conversations
  let loopsNeeded = Math.ceil(convosArray.length / 100);
  let totalErrors = 0;
  while (loopsNeeded > 0) {
    const bulkExportResponse = await csvCreate(convosArray.splice(0, 100));

    if (bulkExportResponse == "Error") {
      console.log("Bulk convo export error. Check your code");
    }
    loopsNeeded--;
  }

  console.log("Total convo creation failures: " + totalErrors);
  console.log("Data Export is complete.");
  console.log("Total time to execute: ");
  console.timeEnd();
})();

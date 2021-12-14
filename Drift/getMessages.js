// Optional to retrieve messages for conversation id rather than transcripts
require('dotenv').config()
const DRIFT_AUTH_TOKEN = process.env.DRIFT_AUTH_TOKEN
const _ = require('lodash');
const axios = require('axios');
const baseUrl = 'https://driftapi.com/conversations/';

const headers = {
    'Authorization': `Bearer ${DRIFT_AUTH_TOKEN}`,
    'Content-Type': 'application/json'
}

//directly from lodash documentation used with .mergeWith method - https://lodash.com/docs#mergeWith
function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
  }
}

const getConvoMessages = async (convoId, data, pagination) => {

  // As this is a recursive function, we need to be able to pass it the previous data. 
  //Here we either used the passed in data, or we create a new objet to hold our data.
  data = data || {};
  pagination = pagination || "";

  await axios.get(baseUrl+convoId+'/messages?next='+pagination, {headers: headers})
    .then(response => {

      // We merge the returned data with the existing data
      _.mergeWith(data, response.data, customizer);
  
      // We check if there is more paginated data to be obtained
      if (response.data.pagination.more) {
          let paginator = response.data.pagination.next;
          return getConvoMessages(convoId, data, paginator);
      }
  }).catch(err => {
    console.log("Error retrieving messages for conversation id: "+convoId);
    console.log("ERR HITTING URL ---> " + err.config.url);
    console.log("ERR CODE ---> " + err.response.status);
    console.log("ERR DATE ---> " + err.response.headers.date);
    console.log("ERR MSG ---> " + err.message);
    data = ({data: {messages: []}}); //return an empty message array if an error occurs
  });

  return data;
}

module.exports = getConvoMessages;

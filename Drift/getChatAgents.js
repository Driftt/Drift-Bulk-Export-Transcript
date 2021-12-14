require('dotenv').config();
const DRIFT_AUTH_TOKEN = process.env.DRIFT_AUTH_TOKEN;
const axios = require('axios');

const getChatAgents = async () => {
  const baseUrl = 'https://driftapi.com/users/list';
  const headers = {
      'Authorization': `Bearer ${DRIFT_AUTH_TOKEN}`,
      'Content-Type': 'application/json'
  }

  let agentsHash = {};

  //No pagination present on this query - this will return the full list of users (you can expose the full user model metadata)
  return axios
      .get(baseUrl, {headers: headers})
      .then((res) => {
        for (let i = 0; i < res.data.data.length; i++){
          agentsHash[res.data.data[i].id] = res.data.data[i];
        }
        return agentsHash;
      })
      .catch(err => {
        console.log("Error retrieving Drift Agents list.");
        console.log("ERR HITTING URL ---> " + err.config.url);
        console.log("ERR CODE ---> " + err.response.status);
        console.log("ERR DATE ---> " + err.response.headers.date);
        console.log("ERR MSG ---> " + err.message);
        return {};
      })
}



module.exports = getChatAgents;

// for testing 
// (async ()=> {
//   let result = await getChatAgents({data:{participants:['2257252','2290384']}});

//   console.log(result);
// })();
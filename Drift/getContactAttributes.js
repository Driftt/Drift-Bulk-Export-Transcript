require("dotenv").config();
const DRIFT_AUTH_TOKEN = process.env.DRIFT_AUTH_TOKEN;

const axios = require("axios");
const baseUrl = "https://driftapi.com/contacts/";
const headers = {
  Authorization: `Bearer ${DRIFT_AUTH_TOKEN}`,
  "Content-Type": "application/json",
};

// Retrieve Contacts' attributes
const getContactAttributes = async (contactId) => {
  return axios
    .get(baseUrl + contactId, { headers: headers })
    .then((res) => {
      let contactAttributes = res.data.data.attributes;
      return contactAttributes;
    })
    .catch((err) => {
      console.log(
        "Error locating contact attributes for contact ID: " + contactId
      );
      console.log("ERR HITTING URL ---> " + err.config.url);
      console.log("ERR CODE ---> " + err.response.status);
      console.log("ERR DATE ---> " + err.response.headers.date);
      console.log("ERR MSG ---> " + err.response.data.error.message);
      console.log("ERR TYPE ---> " + err.response.data.error.type);
      return {};
    });
};

module.exports = getContactAttributes;

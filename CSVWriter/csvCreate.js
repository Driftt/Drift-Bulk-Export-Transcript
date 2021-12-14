// Documentations - https://www.npmjs.com/package/csv-writer
//Writes objects/arrays into a CSV string into a file.
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const date = new Date(); // Set time to differentiate exported file's name

const csvWriter = createCsvWriter({
  path: "./ExportFiles/" + "DriftCSV-" + date + ".csv",

  //Array of objects (id and title properties) or strings (field IDs).
  //A header line will be written to the file only if given as an array of objects.
  header: [
    { id: "convo_id", title: "convo_id" },
    { id: "assignee_id", title: "assignee_id" },
    { id: "link_to_full_conversation", title: "link_to_full_conversation" },
    { id: "company_name", title: "company_name" },
    { id: "updatedat_date", title: "updatedat_date" },
    { id: "createdat_date", title: "createdat_date" },
    { id: "participant", title: "participant" },
    { id: "transcriptObject", title: "transcriptObject" },
    { id: "total_messages", title: "total_messages" },
  ],
});

const csvCreate = async (interactions) => {
  const body = interactions;
// Write collected data into the CSV file
  return csvWriter
    .writeRecords(body)
    .then(() => console.log("Data uploaded into csv successfully"))
    .catch((err) => {
      console.log("Error exporting conversations to CSV.");

      return "Error exporting conversations to CSV.";
    });
};

module.exports = csvCreate;

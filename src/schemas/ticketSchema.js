const { model, Schema } = require('mongoose');

let ticketSchema = new Schema(
  {
    guildID: String,
    ticketMemberID: String,
    ticketChannelID: String,
    parentTicketChannelID: String,
    closed: String,
    membersAdded: Array,
  },
  {
    strict: false,
  }
);

module.exports = model('ticket', ticketSchema);
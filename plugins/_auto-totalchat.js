module.exports = async (m, { kiicode }) => {
    if (!m.isGroup) return;

    const groupId = m.chat;
    const userId = m.sender;

    if (!global.db.data.groups) global.db.data.groups = {};
    if (!global.db.data.groups[groupId]) {
        global.db.data.groups[groupId] = { totalchat: {} };
    }
    if (!global.db.data.groups[groupId].totalchat) {
        global.db.data.groups[groupId].totalchat = {};
    }
    if (!global.db.data.groups[groupId].totalchat[userId]) {
        global.db.data.groups[groupId].totalchat[userId] = 0;
    }

    global.db.data.groups[groupId].totalchat[userId] += 1;
};
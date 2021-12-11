'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("Chatrooms",[{
            id: 1,
            User1Id: 9999,
            createdAt: new Date(),
            updatedAt: new Date()
        }], {})
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("Chatrooms", null, {});
    }
};

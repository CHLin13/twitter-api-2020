'use strict';
module.exports = (sequelize, DataTypes) => {
  const Chatroom = sequelize.define('Chatroom', {
    User1Id: DataTypes.INTEGER,
    User2Id: DataTypes.INTEGER,
    message: DataTypes.TEXT
  }, {});
  Chatroom.associate = function(models) {
    Chatroom.belongsTo(models.User, { foreignKey: "User1Id", as: "User1" })
    Chatroom.belongsTo(models.User, { foreignKey: "User2Id", as: "User2" })
  };
  return Chatroom;
};
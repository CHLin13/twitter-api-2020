'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    SenderId: DataTypes.INTEGER,
    ReceiverId: DataTypes.INTEGER,
    message: DataTypes.TEXT
  }, {});
  Message.associate = function(models) {
    Message.belongsTo(models.User, {
      foreignKey: 'SenderId',
      as: 'Sender'
    })
    Message.belongsTo(models.User, {
      foreignKey: 'ReceiverId',
      as: 'Receiver'
    })
  };
  return Message;
};
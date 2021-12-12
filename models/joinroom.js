'use strict';
module.exports = (sequelize, DataTypes) => {
  const Joinroom = sequelize.define('Joinroom', {
    UserId: DataTypes.INTEGER,
  }, {});
  Joinroom.associate = function (models) {
    Joinroom.belongsTo(models.User)
  };
  return Joinroom;
};
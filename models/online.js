'use strict';
module.exports = (sequelize, DataTypes) => {
  const Online = sequelize.define('Online', {
    UserId: DataTypes.INTEGER
  }, {});
  Online.associate = function (models) {
    Online.belongsTo(models.User)
  };
  return Online;
};
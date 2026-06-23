'use strict';

const { search } = require('../routes/athleteRoutes');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },

        name: {
          type: Sequelize.STRING,
          allowNull: false
        },

        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },

        password: {
          type: Sequelize.STRING,
          allowNull: false
        },

        role: {
          type: Sequelize.ENUM('ATHLETE', 'ADMIN', 'COACH'),
          allowNull: false,
          defaultValue: 'ATHLETE'
        },

        age: {
          type: Sequelize.INTEGER,
          allowNull: false
        },

        sports: {
          type: Sequelize.STRING,
          allowNull: false
        },

        contact: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },

        afiId: {
          type: Sequelize.STRING,
          allowNull: true
        },

        aadhar: {
          type: Sequelize.STRING,
          allowNull: true
        },

        school: {
          type: Sequelize.STRING,
          allowNull: true
        },

        profile: {
          type: Sequelize.STRING,
          allowNull: true
        },
        verify: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        status: {
          type: Sequelize.ENUM(
            'PENDING',
            'APPROVED',
            'REJECT'
          ),
          allowNull: false,
          defaultValue: 'PENDING'
        },

        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },

        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },

        deletedAt: {
          allowNull: true,
          type: Sequelize.DATE
        }
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_status";'
    );
  }
};

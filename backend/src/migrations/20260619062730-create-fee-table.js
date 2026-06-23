'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      month: {
        type: Sequelize.STRING,
        defaultValue: Sequelize.DATE
      },
      year: {
        type: Sequelize.INTEGER,
      },
      screenshot: {
        type: Sequelize.STRING
      },

      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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

      submittedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fees');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_fees_status";'
    );
  }
};

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          nombre: "Juan Perez",
          ci: "12345678",
          celular: "099123456",
          banco: "Banco Nacional",
          cuentaBancaria: "123-456-789",
          password: "defaultpassword", // Add a default password
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Maria Gomez",
          ci: "87654321",
          celular: "098765432",
          banco: "Banco Internacional",
          cuentaBancaria: "987-654-321",
          password: "defaultpassword", // Add a default password
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Carlos Lopez",
          ci: "11223344",
          celular: "097112233",
          banco: "Banco Central",
          cuentaBancaria: "112-233-445",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Ana Torres",
          ci: "55667788",
          celular: "096556677",
          banco: "Banco del Este",
          cuentaBancaria: "556-677-889",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Luis Martinez",
          ci: "99887766",
          celular: "095998877",
          banco: "Banco del Oeste",
          cuentaBancaria: "998-877-665",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Sofia Ramirez",
          ci: "44332211",
          celular: "094443322",
          banco: "Banco del Norte",
          cuentaBancaria: "443-322-110",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Diego Fernandez",
          ci: "66778899",
          celular: "093667788",
          banco: "Banco del Sur",
          cuentaBancaria: "667-788-990",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Laura Castillo",
          ci: "77889900",
          celular: "092778899",
          banco: "Banco Universal",
          cuentaBancaria: "778-899-001",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Pedro Alvarez",
          ci: "33445566",
          celular: "091334455",
          banco: "Banco Popular",
          cuentaBancaria: "334-455-667",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Camila Suarez",
          ci: "22334455",
          celular: "090223344",
          banco: "Banco Familiar",
          cuentaBancaria: "223-344-556",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Jorge Herrera",
          ci: "44556677",
          celular: "089445566",
          banco: "Banco Metropolitano",
          cuentaBancaria: "445-566-778",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Valeria Ortiz",
          ci: "55667799",
          celular: "088556677",
          banco: "Banco Regional",
          cuentaBancaria: "556-677-990",
          password: "defaultpassword",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "users",
      {
        ci: [
          "12345678",
          "87654321",
          "11223344",
          "55667788",
          "99887766",
          "44332211",
          "66778899",
          "77889900",
          "33445566",
          "22334455",
          "44556677",
          "55667799",
        ],
      },
      {}
    );
  },
};

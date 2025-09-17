import { User } from "@/app/models/user.entity";
// Importa el modelo User para interactuar con la base de datos de usuarios.

import type { CreateUserDto } from "../dtos/create-user.dto";
// Importa el tipo CreateUserDto, que define la estructura de los datos para crear un usuario.

import { Intervencion } from "../../../models/intervencion.entity";
// Importa el modelo Intervencion para incluir intervenciones relacionadas al usuario.

import { Perro } from "@/app/models/perro.entity";
// Importa el modelo Perro para incluir perros relacionados al usuario.

import type { PaginationDto } from "@/lib/pagination/pagination.dto";
// Importa el tipo PaginationDto, que define los parámetros de paginación.

import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
// Importa el tipo PaginationResultDto, que define la estructura del resultado paginado.

import { getPaginationResultFromModel } from "@/lib/pagination/transform";
// Importa una función para transformar los resultados de paginación del modelo Sequelize al formato esperado.

import { Op } from "sequelize";
// Importa operadores de Sequelize, como Op.iLike para búsquedas insensibles a mayúsculas/minúsculas.

export class UserService {
// Define la clase UserService, que contiene la lógica para manejar usuarios.

  async findAll(pagination: PaginationDto): Promise<PaginationResultDto<User>> {
    // Método para obtener todos los usuarios con paginación y búsqueda.
    const result = await User.findAndCountAll({
      // Busca y cuenta todos los usuarios según los parámetros.
      where: pagination.query
        ? { nombre: { [Op.iLike]: `%${pagination.query}%` } }
        // Si hay un query, busca usuarios cuyo nombre contenga el texto (insensible a mayúsculas/minúsculas).
        : undefined,
      include: [
        {
          model: Intervencion,
          // Incluye las intervenciones relacionadas al usuario.
        },
        {
          model: Perro,
          as: "perros",
          // Incluye los perros relacionados al usuario, usando el alias "perros".
        },
      ],
      limit: pagination.size,
      // Limita la cantidad de resultados por página.
      offset: pagination.getOffset(),
      // Desplaza los resultados según la página actual.
      order: pagination.getOrder(),
      // Ordena los resultados según los parámetros de paginación.
    });

    return getPaginationResultFromModel(pagination, result);
    // Transforma el resultado de Sequelize al formato de paginación esperado.
  }

  async findOne(username: string): Promise<User | null> {
    // Método para buscar un usuario por su nombre de usuario (clave primaria).
    return await User.findByPk(username);
    // Devuelve el usuario encontrado o null si no existe.
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Método para crear un nuevo usuario.
    return await User.create({ ...createUserDto });
    // Crea el usuario con los datos recibidos y lo devuelve.
  }

  async update(
    username: string,
    updateData: Partial<CreateUserDto>
  ): Promise<User | null> {
    // Método para actualizar los datos de un usuario existente.
    const user = await User.findByPk(username);
    // Busca el usuario por su nombre de usuario.
    if (!user) return null;
    // Si no existe, devuelve null.
    return await user.update(updateData);
    // Actualiza los datos del usuario y lo devuelve.
  }

  async delete(username: string): Promise<boolean> {
    // Método para eliminar un usuario por su nombre de usuario.
    const deleted = await User.destroy({
      where: { username },
      // Elimina el usuario que coincide con el nombre de usuario.
    });

    return deleted > 0;
    // Devuelve true si se eliminó algún usuario, false si no.
  }
}

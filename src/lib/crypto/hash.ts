import bcrypt from "bcrypt";

export class Hashing {
<<<<<<< HEAD
	// Hashear contraseña
	static async hashPassword(password: string) {
		const saltRounds = 10;
		return await bcrypt.hash(password, saltRounds);
	}

	// Verificar contraseña
	static async verifyPassword(password: string, hash: string) {
		return await bcrypt.compare(password, hash);
	}
}
=======
  // Hashear contraseña
  static async hashPassword(password: string) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verificar contraseña
  static async verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
>>>>>>> dev

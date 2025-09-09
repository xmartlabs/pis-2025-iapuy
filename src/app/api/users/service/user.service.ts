import { User } from "@/app/api/users/models/user.entity";
import { CreateUserDto } from "../dtos/create-user.dto";

export class UserService {
  async findAll(): Promise<User[]> {
    return await User.findAll();
  }

  async findOne(username: string): Promise<User | null> {
    return await User.findByPk(username);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await User.create({ ...createUserDto });
  }

  async update(
    username: string,
    updateData: Partial<CreateUserDto>
  ): Promise<User | null> {
    const user = await User.findByPk(username);
    if (!user) return null;

    return await user.update(updateData);
  }

  async delete(username: string): Promise<boolean> {
    const deleted = await User.destroy({
      where: { username },
    });

    return deleted > 0;
  }
}

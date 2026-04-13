import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    try {
      // Verificar si el usuario admin ya existe
      const adminExists = await this.userRepository.findOne({
        where: { email: 'admin@admin.com' },
      });

      if (adminExists) {
        this.logger.log('Usuario admin ya existe, saltando seeder');
        return;
      }

      // Hashear la contraseña con bcrypt (10 rounds es estándar)
      const hashedPassword = await bcrypt.hash('admin', 10);

      // Crear el usuario admin
      const adminUser = this.userRepository.create({
        email: 'admin@admin.com',
        name: 'Administrador',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });

      await this.userRepository.save(adminUser);
      this.logger.log('✅ Usuario admin creado exitosamente');
      this.logger.log('   Email: admin@admin.com');
      this.logger.log('   Contraseña: admin');
      this.logger.log('   Rol: admin');
    } catch (error) {
      this.logger.error('❌ Error al crear usuario admin', error);
      throw error;
    }
  }
}

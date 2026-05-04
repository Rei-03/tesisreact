import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { env } from '../../config/env';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    // El seeder se ejecuta solo si no viene de un proceso de inicialización normal
    // En producción, los usuarios deben ser creados manualmente a través de la API
    const shouldSkipSeeding = process.env.SKIP_USER_SEEDING === 'true';

    if (shouldSkipSeeding) {
      this.logger.log('⏭️  UserSeeder deshabilitado (SKIP_USER_SEEDING=true)');
      return;
    }

    try {
      // Verificar si el usuario admin ya existe
      const adminExists = await this.userRepository.findOne({
        where: { email: 'admin@admin.com' },
      });

      if (adminExists) {
        this.logger.log('ℹ️  Usuario admin ya existe, saltando seeder');
        return;
      }

      // Crear el usuario admin inicial
      const hashedPassword = await bcrypt.hash('admin', 10);

      const adminUser = this.userRepository.create({
        email: 'admin@admin.com',
        name: 'Administrador',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });

      await this.userRepository.save(adminUser);
      this.logger.log('✅ Usuario admin inicial creado');
      this.logger.log('   Email: admin@admin.com | Contraseña: admin');
      this.logger.warn('⚠️  IMPORTANTE: Cambiar contraseña inmediatamente después del primer login');
    } catch (error) {
      this.logger.error('❌ Error al crear usuario admin', error);
      throw error;
    }
  }
}

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      username: 'admin',
      password_hash: passwordHash,
      role: UserRole.admin,
      enabled: true,
    },
  });

  await prisma.user.create({
    data: {
      username: 'teacher',
      password_hash: passwordHash,
      role: UserRole.teacher,
      enabled: true,
    },
  });

  const students = Array.from({ length: 5 }).map((_, index) => ({
    seat_no: index + 1,
    name: `Student ${index + 1}`,
    gender: index % 2 === 0 ? 'male' : 'female',
    birth_date: new Date(2008, 0, index + 1),
    dorm_no: `D-${index + 1}`,
    id_card_no: `IDCARD${index + 1}`,
    father_name: `Father ${index + 1}`,
    father_phone: `1380000000${index}`,
    mother_name: `Mother ${index + 1}`,
    mother_phone: `1390000000${index}`,
    home_address: `Address ${index + 1}`,
  }));

  await prisma.student.createMany({ data: students });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

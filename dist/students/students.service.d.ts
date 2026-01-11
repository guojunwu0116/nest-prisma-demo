import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
export declare class StudentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateStudentDto): import("@prisma/client").Prisma.Prisma__StudentClient<{
        studentNo: string;
        name: string;
        className: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        studentNo: string;
        name: string;
        className: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
}

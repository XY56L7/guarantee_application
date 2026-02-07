import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InMemoryDatabase } from '../database/in-memory.database';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly db: InMemoryDatabase) {}

  async onModuleInit() {
    await this.seedUsers();
    this.seedGuaranteeChecks();
  }

  private async seedUsers() {
    const dummyUsers = [
      {
        id: 1,
        email: 'user@example.com',
        password: 'User1234!',
        name: 'Test User',
      },
      {
        id: 2,
        email: 'admin@example.com',
        password: 'Admin1234!',
        name: 'Admin User',
      },
      {
        id: 3,
        email: 'demo@example.com',
        password: 'Demo1234!',
        name: 'Demo User',
      },
      {
        id: 4,
        email: 'john.doe@example.com',
        password: 'John1234!',
        name: 'John Doe',
      },
      {
        id: 5,
        email: 'jane.smith@example.com',
        password: 'Jane1234!',
        name: 'Jane Smith',
      },
      {
        id: 6,
        email: 'bob.wilson@example.com',
        password: 'Bob1234!',
        name: 'Bob Wilson',
      },
      {
        id: 7,
        email: 'alice.brown@example.com',
        password: 'Alice1234!',
        name: 'Alice Brown',
      },
      {
        id: 8,
        email: 'charlie.davis@example.com',
        password: 'Charlie1234!',
        name: 'Charlie Davis',
      },
      {
        id: 9,
        email: 'diana.miller@example.com',
        password: 'Diana1234!',
        name: 'Diana Miller',
      },
      {
        id: 10,
        email: 'frank.taylor@example.com',
        password: 'Frank1234!',
        name: 'Frank Taylor',
      },
    ];

    const users = [];
    for (const user of dummyUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      users.push({
        ...user,
        password: hashedPassword,
        createdAt: new Date(),
      });
    }

    this.db.setUsers(users);
    console.log(`Seeded ${users.length} users`);
  }

  private seedGuaranteeChecks() {
    const now = new Date();
    const dummyChecks = [
      {
        id: 1,
        userId: 1,
        storeName: 'MediaMarkt',
        productName: 'Samsung Galaxy S23',
        purchaseDate: '2024-01-15',
        expiryDate: '2025-01-15',
        imagePath: 'dummy_image_1.jpg',
        notes: 'Új Samsung telefon, 2 év garancia',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId: 1,
        storeName: 'IKEA',
        productName: 'BILLY könyvespolc',
        purchaseDate: '2024-02-10',
        expiryDate: '2026-02-10',
        imagePath: 'dummy_image_2.jpg',
        notes: 'IKEA bútor, 2 év garancia',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        userId: 2,
        storeName: 'MediaMarkt',
        productName: 'Dell Inspiron 15',
        purchaseDate: '2023-06-01',
        expiryDate: '2024-12-15',
        imagePath: 'dummy_image_3.jpg',
        notes: 'Dell laptop, 1 év garancia',
        createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      },
      {
        id: 4,
        userId: 2,
        storeName: 'Spar',
        productName: 'Sony WH-1000XM4',
        purchaseDate: '2022-03-15',
        expiryDate: '2023-03-15',
        imagePath: 'dummy_image_4.jpg',
        notes: 'Sony fejhallgató, 1 év garancia',
        createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      },
      {
        id: 5,
        userId: 3,
        storeName: 'Tesco',
        productName: 'Bosch kávéfőző',
        purchaseDate: '2024-03-01',
        expiryDate: '2025-03-01',
        imagePath: 'dummy_image_5.jpg',
        notes: 'Bosch kávéfőző, 1 év garancia',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: 6,
        userId: 3,
        storeName: 'Auchan',
        productName: 'Nike Air Max 270',
        purchaseDate: '2024-01-20',
        expiryDate: '2025-01-20',
        imagePath: 'dummy_image_6.jpg',
        notes: 'Nike cipő, 1 év garancia',
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        id: 7,
        userId: 4,
        storeName: 'MediaMarkt',
        productName: 'iPad Air 5',
        purchaseDate: '2023-08-15',
        expiryDate: '2024-12-20',
        imagePath: 'dummy_image_7.jpg',
        notes: 'Apple iPad, 1 év garancia',
        createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      },
      {
        id: 8,
        userId: 4,
        storeName: 'MediaMarkt',
        productName: 'PlayStation 5',
        purchaseDate: '2024-02-28',
        expiryDate: '2025-02-28',
        imagePath: 'dummy_image_8.jpg',
        notes: 'Sony PlayStation 5, 1 év garancia',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: 9,
        userId: 5,
        storeName: 'IKEA',
        productName: 'SMÅSTAD szekrény',
        purchaseDate: '2024-01-05',
        expiryDate: '2026-01-05',
        imagePath: 'dummy_image_9.jpg',
        notes: 'IKEA szekrény, 2 év garancia',
        createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      },
      {
        id: 10,
        userId: 5,
        storeName: 'Spar',
        productName: 'Canon EOS R6',
        purchaseDate: '2021-12-10',
        expiryDate: '2022-12-10',
        imagePath: 'dummy_image_10.jpg',
        notes: 'Canon kamera, 1 év garancia',
        createdAt: new Date(now.getTime() - 500 * 24 * 60 * 60 * 1000),
      },
    ];

    this.db.setGuaranteeChecks(dummyChecks);
    console.log(`Seeded ${dummyChecks.length} guarantee checks`);
  }
}

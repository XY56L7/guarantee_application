import 'dart:io';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import '../models/guarantee_check.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, 'guarantee_checks.db');
    
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE guarantee_checks(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        storeName TEXT NOT NULL,
        productName TEXT NOT NULL,
        purchaseDate TEXT NOT NULL,
        expiryDate TEXT NOT NULL,
        imagePath TEXT NOT NULL,
        notes TEXT,
        createdAt TEXT NOT NULL
      )
    ''');
  }

  // Insert a new guarantee check
  Future<int> insertGuaranteeCheck(GuaranteeCheck guaranteeCheck) async {
    final db = await database;
    return await db.insert('guarantee_checks', guaranteeCheck.toMap());
  }

  // Get all guarantee checks
  Future<List<GuaranteeCheck>> getAllGuaranteeChecks() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'guarantee_checks',
      orderBy: 'createdAt DESC',
    );

    return List.generate(maps.length, (i) {
      return GuaranteeCheck.fromMap(maps[i]);
    });
  }

  // Get guarantee check by ID
  Future<GuaranteeCheck?> getGuaranteeCheckById(int id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'guarantee_checks',
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isNotEmpty) {
      return GuaranteeCheck.fromMap(maps.first);
    }
    return null;
  }

  // Update guarantee check
  Future<int> updateGuaranteeCheck(GuaranteeCheck guaranteeCheck) async {
    final db = await database;
    return await db.update(
      'guarantee_checks',
      guaranteeCheck.toMap(),
      where: 'id = ?',
      whereArgs: [guaranteeCheck.id],
    );
  }

  // Delete guarantee check
  Future<int> deleteGuaranteeCheck(int id) async {
    final db = await database;
    
    // Get the guarantee check to delete the image file
    final guaranteeCheck = await getGuaranteeCheckById(id);
    if (guaranteeCheck != null) {
      // Delete the image file
      final imageFile = File(guaranteeCheck.imagePath);
      if (await imageFile.exists()) {
        await imageFile.delete();
      }
    }
    
    return await db.delete(
      'guarantee_checks',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Get expired guarantee checks
  Future<List<GuaranteeCheck>> getExpiredGuaranteeChecks() async {
    final allChecks = await getAllGuaranteeChecks();
    return allChecks.where((check) => check.isExpired).toList();
  }

  // Get guarantee checks expiring soon
  Future<List<GuaranteeCheck>> getExpiringSoonGuaranteeChecks() async {
    final allChecks = await getAllGuaranteeChecks();
    return allChecks.where((check) => check.expiresSoon).toList();
  }

  // Search guarantee checks
  Future<List<GuaranteeCheck>> searchGuaranteeChecks(String query) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'guarantee_checks',
      where: 'storeName LIKE ? OR productName LIKE ? OR notes LIKE ?',
      whereArgs: ['%$query%', '%$query%', '%$query%'],
      orderBy: 'createdAt DESC',
    );

    return List.generate(maps.length, (i) {
      return GuaranteeCheck.fromMap(maps[i]);
    });
  }

  // Close database
  Future<void> close() async {
    final db = await database;
    db.close();
  }
}

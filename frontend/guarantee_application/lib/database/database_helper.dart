import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:path/path.dart';
import '../models/guarantee_check.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  static Database? _database;
  static SharedPreferences? _prefs;
  static const String _storageKey = 'guarantee_checks';
  static int _nextId = 1;

  Future<Database?> get database async {
    if (kIsWeb) {
      return null;
    }
    if (_database != null) return _database!;
    try {
      _database = await _initDatabase();
      return _database!;
    } on MissingPluginException {
      if (kIsWeb) {
        return null;
      }
      rethrow;
    } catch (_) {
      if (kIsWeb) {
        return null;
      }
      rethrow;
    }
  }

  Future<Database> _initDatabase() async {
    if (kIsWeb) {
      throw UnsupportedError('SQLite nem támogatott web platformon');
    }
    try {
      final documentsDirectory = await getApplicationDocumentsDirectory();
      final String dbPath = join(documentsDirectory.path, 'guarantee_checks.db');
      
      return await openDatabase(
        dbPath,
        version: 1,
        onCreate: _onCreate,
      );
    } on MissingPluginException {
      if (kIsWeb) {
        throw UnsupportedError('SQLite nem támogatott web platformon');
      }
      rethrow;
    } catch (e) {
      if (kIsWeb) {
        throw UnsupportedError('SQLite nem támogatott web platformon: $e');
      }
      rethrow;
    }
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

  Future<int> insertGuaranteeCheck(GuaranteeCheck guaranteeCheck) async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      final map = guaranteeCheck.toMap();
      map['id'] = _nextId++;
      
      final allChecks = _getWebStorage();
      allChecks.add(map);
      await _saveWebStorage(allChecks);
      return map['id'] as int;
    }
    final db = await database;
    return await db!.insert('guarantee_checks', guaranteeCheck.toMap());
  }
  
  List<Map<String, dynamic>> _getWebStorage() {
    if (kIsWeb && _prefs != null) {
      final jsonString = _prefs!.getString(_storageKey);
      if (jsonString != null) {
        final List<dynamic> jsonList = json.decode(jsonString);
        return jsonList.map((item) => item as Map<String, dynamic>).toList();
      }
    }
    return [];
  }
  
  Future<void> _saveWebStorage(List<Map<String, dynamic>> data) async {
    if (kIsWeb && _prefs != null) {
      final jsonString = json.encode(data);
      await _prefs!.setString(_storageKey, jsonString);
    }
  }

  Future<List<GuaranteeCheck>> getAllGuaranteeChecks() async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      final sorted = List<Map<String, dynamic>>.from(_getWebStorage());
      sorted.sort((a, b) {
        final dateA = DateTime.parse(a['createdAt'] as String);
        final dateB = DateTime.parse(b['createdAt'] as String);
        return dateB.compareTo(dateA);
      });
      return sorted.map((map) => GuaranteeCheck.fromMap(map)).toList();
    }
    final db = await database;
    final List<Map<String, dynamic>> maps = await db!.query(
      'guarantee_checks',
      orderBy: 'createdAt DESC',
    );

    return List.generate(maps.length, (i) {
      return GuaranteeCheck.fromMap(maps[i]);
    });
  }

  Future<GuaranteeCheck?> getGuaranteeCheckById(int id) async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      try {
        final allChecks = _getWebStorage();
        final map = allChecks.firstWhere((item) => item['id'] == id);
        return GuaranteeCheck.fromMap(map);
      } catch (e) {
        return null;
      }
    }
    final db = await database;
    final List<Map<String, dynamic>> maps = await db!.query(
      'guarantee_checks',
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isNotEmpty) {
      return GuaranteeCheck.fromMap(maps.first);
    }
    return null;
  }

  Future<int> updateGuaranteeCheck(GuaranteeCheck guaranteeCheck) async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      final allChecks = _getWebStorage();
      final index = allChecks.indexWhere((item) => item['id'] == guaranteeCheck.id);
      if (index != -1) {
        allChecks[index] = guaranteeCheck.toMap();
        await _saveWebStorage(allChecks);
        return 1;
      }
      return 0;
    }
    final db = await database;
    return await db!.update(
      'guarantee_checks',
      guaranteeCheck.toMap(),
      where: 'id = ?',
      whereArgs: [guaranteeCheck.id],
    );
  }

  Future<int> deleteGuaranteeCheck(int id) async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      final allChecks = _getWebStorage();
      final index = allChecks.indexWhere((item) => item['id'] == id);
      if (index != -1) {
        allChecks.removeAt(index);
        await _saveWebStorage(allChecks);
        return 1;
      }
      return 0;
    }
    final db = await database;
    
    final guaranteeCheck = await getGuaranteeCheckById(id);
    if (guaranteeCheck != null && !kIsWeb) {
      try {
        final imageFile = File(guaranteeCheck.imagePath);
        if (await imageFile.exists()) {
          await imageFile.delete();
        }
      } catch (_) {
        // ignore: empty_catches
      }
    }
    return await db!.delete(
      'guarantee_checks',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<List<GuaranteeCheck>> getExpiredGuaranteeChecks() async {
    final allChecks = await getAllGuaranteeChecks();
    return allChecks.where((check) => check.isExpired).toList();
  }

  Future<List<GuaranteeCheck>> getExpiringSoonGuaranteeChecks() async {
    final allChecks = await getAllGuaranteeChecks();
    return allChecks.where((check) => check.expiresSoon).toList();
  }

  Future<List<GuaranteeCheck>> searchGuaranteeChecks(String query) async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      final lowerQuery = query.toLowerCase();
      final allChecks = _getWebStorage();
      final filtered = allChecks.where((item) {
        final storeName = (item['storeName'] as String? ?? '').toLowerCase();
        final productName = (item['productName'] as String? ?? '').toLowerCase();
        final notes = (item['notes'] as String? ?? '').toLowerCase();
        return storeName.contains(lowerQuery) ||
            productName.contains(lowerQuery) ||
            notes.contains(lowerQuery);
      }).toList();
      
      filtered.sort((a, b) {
        final dateA = DateTime.parse(a['createdAt'] as String);
        final dateB = DateTime.parse(b['createdAt'] as String);
        return dateB.compareTo(dateA);
      });
      
      return filtered.map((map) => GuaranteeCheck.fromMap(map)).toList();
    }
    final db = await database;
    final List<Map<String, dynamic>> maps = await db!.query(
      'guarantee_checks',
      where: 'storeName LIKE ? OR productName LIKE ? OR notes LIKE ?',
      whereArgs: ['%$query%', '%$query%', '%$query%'],
      orderBy: 'createdAt DESC',
    );

    return List.generate(maps.length, (i) {
      return GuaranteeCheck.fromMap(maps[i]);
    });
  }

  Future<void> close() async {
    if (kIsWeb) {
      if (_prefs != null) {
        await _prefs!.remove(_storageKey);
      }
      _nextId = 1;
      return;
    }
    final db = await database;
    await db!.close();
  }
}

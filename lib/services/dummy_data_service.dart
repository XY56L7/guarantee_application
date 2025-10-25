import '../models/guarantee_check.dart';
import '../database/database_helper.dart';

class DummyDataService {
  static final DummyDataService _instance = DummyDataService._internal();
  factory DummyDataService() => _instance;
  DummyDataService._internal();

  final DatabaseHelper _databaseHelper = DatabaseHelper();

  /// Add dummy guarantee checks for testing
  Future<void> addDummyData() async {
    try {
      // Always add dummy data for testing
      // Commented out the check to allow loading dummy data

      final dummyChecks = [
        // Valid guarantee - Samsung phone
        GuaranteeCheck(
          storeName: 'MediaMarkt',
          productName: 'Samsung Galaxy S23',
          purchaseDate: '2024-01-15',
          expiryDate: '2025-01-15',
          imagePath: 'dummy_image_1.jpg',
          notes: 'Új Samsung telefon, 2 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 30)),
        ),

        // Valid guarantee - IKEA furniture
        GuaranteeCheck(
          storeName: 'IKEA',
          productName: 'BILLY könyvespolc',
          purchaseDate: '2024-02-10',
          expiryDate: '2026-02-10',
          imagePath: 'dummy_image_2.jpg',
          notes: 'IKEA bútor, 2 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 20)),
        ),

        // Expiring soon - Laptop
        GuaranteeCheck(
          storeName: 'MediaMarkt',
          productName: 'Dell Inspiron 15',
          purchaseDate: '2023-06-01',
          expiryDate: '2024-12-15', // Expires in a few days
          imagePath: 'dummy_image_3.jpg',
          notes: 'Dell laptop, 1 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 180)),
        ),

        // Expired guarantee - Headphones
        GuaranteeCheck(
          storeName: 'Spar',
          productName: 'Sony WH-1000XM4',
          purchaseDate: '2022-03-15',
          expiryDate: '2023-03-15', // Already expired
          imagePath: 'dummy_image_4.jpg',
          notes: 'Sony fejhallgató, 1 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 365)),
        ),

        // Valid guarantee - Kitchen appliance
        GuaranteeCheck(
          storeName: 'Tesco',
          productName: 'Bosch kávéfőző',
          purchaseDate: '2024-03-01',
          expiryDate: '2025-03-01',
          imagePath: 'dummy_image_5.jpg',
          notes: 'Bosch kávéfőző, 1 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 10)),
        ),

        // Valid guarantee - Sports equipment
        GuaranteeCheck(
          storeName: 'Auchan',
          productName: 'Nike Air Max 270',
          purchaseDate: '2024-01-20',
          expiryDate: '2025-01-20',
          imagePath: 'dummy_image_6.jpg',
          notes: 'Nike cipő, 1 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 25)),
        ),

        // Expiring soon - Tablet
        GuaranteeCheck(
          storeName: 'MediaMarkt',
          productName: 'iPad Air 5',
          purchaseDate: '2023-08-15',
          expiryDate: '2024-12-20', // Expires soon
          imagePath: 'dummy_image_7.jpg',
          notes: 'Apple iPad, 1 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 120)),
        ),

        // Valid guarantee - Gaming console
        GuaranteeCheck(
          storeName: 'MediaMarkt',
          productName: 'PlayStation 5',
          purchaseDate: '2024-02-28',
          expiryDate: '2025-02-28',
          imagePath: 'dummy_image_8.jpg',
          notes: 'Sony PlayStation 5, 1 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 15)),
        ),

        // Valid guarantee - Home appliance
        GuaranteeCheck(
          storeName: 'IKEA',
          productName: 'SMÅSTAD szekrény',
          purchaseDate: '2024-01-05',
          expiryDate: '2026-01-05',
          imagePath: 'dummy_image_9.jpg',
          notes: 'IKEA szekrény, 2 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 40)),
        ),

        // Expired guarantee - Camera
        GuaranteeCheck(
          storeName: 'Spar',
          productName: 'Canon EOS R6',
          purchaseDate: '2021-12-10',
          expiryDate: '2022-12-10', // Long expired
          imagePath: 'dummy_image_10.jpg',
          notes: 'Canon kamera, 1 év garancia',
          createdAt: DateTime.now().subtract(const Duration(days: 500)),
        ),
      ];

      // Insert all dummy checks
      for (final check in dummyChecks) {
        await _databaseHelper.insertGuaranteeCheck(check);
      }

    } catch (e) {
      throw Exception('Hiba a dummy adatok hozzáadásakor: $e');
    }
  }

  /// Clear all dummy data
  Future<void> clearDummyData() async {
    try {
      final allChecks = await _databaseHelper.getAllGuaranteeChecks();
      for (final check in allChecks) {
        if (check.id != null) {
          await _databaseHelper.deleteGuaranteeCheck(check.id!);
        }
      }
    } catch (e) {
      throw Exception('Hiba a dummy adatok törlésekor: $e');
    }
  }

  /// Get statistics about dummy data
  Future<Map<String, int>> getDummyDataStats() async {
    try {
      final allChecks = await _databaseHelper.getAllGuaranteeChecks();
      final expiredChecks = await _databaseHelper.getExpiredGuaranteeChecks();
      final expiringSoonChecks = await _databaseHelper.getExpiringSoonGuaranteeChecks();

      return {
        'total': allChecks.length,
        'expired': expiredChecks.length,
        'expiringSoon': expiringSoonChecks.length,
        'valid': allChecks.length - expiredChecks.length - expiringSoonChecks.length,
      };
    } catch (e) {
      throw Exception('Hiba a statisztikák lekérdezésekor: $e');
    }
  }
}

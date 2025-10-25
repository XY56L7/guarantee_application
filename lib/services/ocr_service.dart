import 'dart:io';

class OCRService {
  static final OCRService _instance = OCRService._internal();
  factory OCRService() => _instance;
  OCRService._internal();

  /// Mock OCR service - returns sample text for testing
  Future<String> extractTextFromImage(File imageFile) async {
    // Simulate processing delay
    await Future.delayed(const Duration(seconds: 2));
    
    // Return sample Hungarian guarantee text for testing
    return '''
MediaMarkt Magyarország Kft.
Garancia igazolás

Termék: Samsung Galaxy S23
Vásárlás dátuma: 2024.01.15
Garancia lejárat: 2025.01.15

Garancia feltételei:
- 2 év garancia
- Csak eredeti alkatrészekkel
- Garancia nem vonatkozik mechanikai sérülésekre
- Garancia kizárva vízbe kerülés esetén
- Külföldi használat esetén garancia nem érvényes

Üzlet: MediaMarkt Budapest
Cím: 1117 Budapest, Infopark sétány 1.
''';
  }

  /// Mock text blocks for testing
  Future<List<MockTextBlock>> extractTextBlocks(File imageFile) async {
    await Future.delayed(const Duration(seconds: 2));
    
    return [
      MockTextBlock('MediaMarkt Magyarország Kft.'),
      MockTextBlock('Garancia igazolás'),
      MockTextBlock('Termék: Samsung Galaxy S23'),
      MockTextBlock('Vásárlás dátuma: 2024.01.15'),
      MockTextBlock('Garancia lejárat: 2025.01.15'),
      MockTextBlock('Garancia nem vonatkozik mechanikai sérülésekre'),
      MockTextBlock('Garancia kizárva vízbe kerülés esetén'),
      MockTextBlock('Külföldi használat esetén garancia nem érvényes'),
    ];
  }

  void dispose() {
    // No cleanup needed for mock service
  }
}

/// Mock text block class
class MockTextBlock {
  final String text;
  
  MockTextBlock(this.text);
}

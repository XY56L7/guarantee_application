import 'dart:io';

class OCRService {
  static final OCRService _instance = OCRService._internal();
  factory OCRService() => _instance;
  OCRService._internal();

  Future<String> extractTextFromImage(File imageFile) async {
    await Future.delayed(const Duration(seconds: 2));
    
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
  }
}

class MockTextBlock {
  final String text;
  
  MockTextBlock(this.text);
}

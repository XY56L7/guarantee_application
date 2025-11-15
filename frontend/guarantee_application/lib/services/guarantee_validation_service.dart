import 'ocr_service.dart';

class GuaranteeValidationResult {
  final bool isValid;
  final bool isExcluded;
  final List<String> warnings;
  final List<String> exclusions;
  final String? extractedStoreName;
  final String? extractedProductName;
  final String? extractedPurchaseDate;
  final String? extractedExpiryDate;

  GuaranteeValidationResult({
    required this.isValid,
    required this.isExcluded,
    required this.warnings,
    required this.exclusions,
    this.extractedStoreName,
    this.extractedProductName,
    this.extractedPurchaseDate,
    this.extractedExpiryDate,
  });
}

class GuaranteeValidationService {
  static final GuaranteeValidationService _instance = GuaranteeValidationService._internal();
  factory GuaranteeValidationService() => _instance;
  GuaranteeValidationService._internal();

  final List<RegExp> _exclusionPatterns = [
    RegExp(r'kizárva|kizárás|nem vonatkozik|nem érvényes', caseSensitive: false),
    RegExp(r'garancia kizárva|garancia nem vonatkozik', caseSensitive: false),
    RegExp(r'garanciális javítás kizárva', caseSensitive: false),
    
    RegExp(r'fogyóeszközök|fogyóeszköz|fogyó alkatrészek', caseSensitive: false),
    RegExp(r'elektromos alkatrészek|elektronikai alkatrészek', caseSensitive: false),
    RegExp(r'mechanikai alkatrészek|mechanikai sérülések', caseSensitive: false),
    
    RegExp(r'mechanikai sérülés|mechanikai károsodás', caseSensitive: false),
    RegExp(r'vízbe kerülés|nedvesség|rozsdásodás', caseSensitive: false),
    RegExp(r'ütés|esés|összetörés|karcolás', caseSensitive: false),
    RegExp(r'nem gyári módosítás|nem gyári beavatkozás', caseSensitive: false),
    
    RegExp(r'kereskedelmi használat|professzionális használat', caseSensitive: false),
    RegExp(r'külföldi használat|külföldön történt', caseSensitive: false),
    
    RegExp(r'garancia lejárt|garancia időtartama lejárt', caseSensitive: false),
    RegExp(r'garancia nem érvényes|garancia érvénytelen', caseSensitive: false),
  ];

  final List<RegExp> _warningPatterns = [
    RegExp(r'csak eredeti alkatrészekkel|csak eredeti szervizben', caseSensitive: false),
    RegExp(r'garancia feltételei|garancia szabályai', caseSensitive: false),
    RegExp(r'karbantartás szükséges|rendszeres karbantartás', caseSensitive: false),
  ];

  final List<RegExp> _storePatterns = [
    RegExp(r'(MediaMarkt|Media Markt)', caseSensitive: false),
    RegExp(r'(IKEA)', caseSensitive: false),
    RegExp(r'(Spar|SPAR)', caseSensitive: false),
    RegExp(r'(Tesco|TESCO)', caseSensitive: false),
    RegExp(r'(Auchan|AUCHAN)', caseSensitive: false),
    RegExp(r'(Aldi|ALDI)', caseSensitive: false),
    RegExp(r'(Lidl|LIDL)', caseSensitive: false),
    RegExp(r'(Penny|PENNY)', caseSensitive: false),
    RegExp(r'(CBA)', caseSensitive: false),
    RegExp(r'(Coop|COOP)', caseSensitive: false),
  ];

  final List<RegExp> _datePatterns = [
    RegExp(r'\d{4}\.\d{1,2}\.\d{1,2}'),
    RegExp(r'\d{1,2}\.\d{1,2}\.\d{4}'),
    RegExp(r'\d{1,2}/\d{1,2}/\d{4}'),
    RegExp(r'\d{4}-\d{1,2}-\d{1,2}'),
  ];

  Future<GuaranteeValidationResult> validateGuaranteeText(List<MockTextBlock> textBlocks) async {
    final fullText = textBlocks.map((block) => block.text).join(' ').toLowerCase();
    
    List<String> exclusions = [];
    List<String> warnings = [];
    
    for (final pattern in _exclusionPatterns) {
      final matches = pattern.allMatches(fullText);
      for (final match in matches) {
        exclusions.add(match.group(0) ?? '');
      }
    }
    
    for (final pattern in _warningPatterns) {
      final matches = pattern.allMatches(fullText);
      for (final match in matches) {
        warnings.add(match.group(0) ?? '');
      }
    }
    
    String? storeName;
    for (final pattern in _storePatterns) {
      final match = pattern.firstMatch(fullText);
      if (match != null) {
        storeName = match.group(0);
        break;
      }
    }
    
    String? purchaseDate;
    String? expiryDate;
    final dateMatches = <String>[];
    
    for (final pattern in _datePatterns) {
      final matches = pattern.allMatches(fullText);
      for (final match in matches) {
        dateMatches.add(match.group(0) ?? '');
      }
    }
    
    if (dateMatches.isNotEmpty) {
      purchaseDate = dateMatches.first;
      if (dateMatches.length > 1) {
        expiryDate = dateMatches[1];
      }
    }
    
    String? productName = _extractProductName(fullText);
    
    final isExcluded = exclusions.isNotEmpty;
    final isValid = !isExcluded;
    
    return GuaranteeValidationResult(
      isValid: isValid,
      isExcluded: isExcluded,
      warnings: warnings,
      exclusions: exclusions,
      extractedStoreName: storeName,
      extractedProductName: productName,
      extractedPurchaseDate: purchaseDate,
      extractedExpiryDate: expiryDate,
    );
  }

  String? _extractProductName(String text) {
    final productPatterns = [
      RegExp(r'(Samsung|Apple|iPhone|Galaxy|iPad|MacBook)', caseSensitive: false),
      RegExp(r'(LG|Sony|Panasonic|Philips)', caseSensitive: false),
      RegExp(r'(Dell|HP|Lenovo|Asus)', caseSensitive: false),
      RegExp(r'(Nike|Adidas|Puma|Reebok)', caseSensitive: false),
    ];
    
    for (final pattern in productPatterns) {
      final match = pattern.firstMatch(text);
      if (match != null) {
        return match.group(0);
      }
    }
    
    return null;
  }

  List<String> getExclusionReasons(List<String> exclusions) {
    final reasons = <String>[];
    
    for (final exclusion in exclusions) {
      final lowerExclusion = exclusion.toLowerCase();
      
      if (lowerExclusion.contains('kizárva') || lowerExclusion.contains('kizárás')) {
        reasons.add('Ez a garancia kizárva van');
      } else if (lowerExclusion.contains('fogyóeszköz')) {
        reasons.add('Fogyóeszközök nem tartoznak garanciális javításba');
      } else if (lowerExclusion.contains('mechanikai')) {
        reasons.add('Mechanikai sérülések nem tartoznak garanciális javításba');
      } else if (lowerExclusion.contains('vízbe') || lowerExclusion.contains('nedvesség')) {
        reasons.add('Vízbe kerülés vagy nedvesség okozta kár nem tartozik garanciális javításba');
      } else if (lowerExclusion.contains('ütés') || lowerExclusion.contains('esés')) {
        reasons.add('Ütés vagy esés okozta kár nem tartozik garanciális javításba');
      } else if (lowerExclusion.contains('kereskedelmi')) {
        reasons.add('Kereskedelmi használat esetén a garancia nem érvényes');
      } else if (lowerExclusion.contains('külföldi')) {
        reasons.add('Külföldi használat esetén a garancia nem érvényes');
      } else if (lowerExclusion.contains('lejárt')) {
        reasons.add('A garancia időtartama lejárt');
      } else {
        reasons.add('Garancia kizárva: $exclusion');
      }
    }
    
    return reasons;
  }
}

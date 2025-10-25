class GuaranteeCheck {
  final int? id;
  final String storeName;
  final String productName;
  final String purchaseDate;
  final String expiryDate;
  final String imagePath;
  final String? notes;
  final DateTime createdAt;

  GuaranteeCheck({
    this.id,
    required this.storeName,
    required this.productName,
    required this.purchaseDate,
    required this.expiryDate,
    required this.imagePath,
    this.notes,
    required this.createdAt,
  });

  // Convert GuaranteeCheck to Map for database storage
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'storeName': storeName,
      'productName': productName,
      'purchaseDate': purchaseDate,
      'expiryDate': expiryDate,
      'imagePath': imagePath,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  // Create GuaranteeCheck from Map (from database)
  factory GuaranteeCheck.fromMap(Map<String, dynamic> map) {
    return GuaranteeCheck(
      id: map['id'],
      storeName: map['storeName'],
      productName: map['productName'],
      purchaseDate: map['purchaseDate'],
      expiryDate: map['expiryDate'],
      imagePath: map['imagePath'],
      notes: map['notes'],
      createdAt: DateTime.parse(map['createdAt']),
    );
  }

  // Copy with method for updating
  GuaranteeCheck copyWith({
    int? id,
    String? storeName,
    String? productName,
    String? purchaseDate,
    String? expiryDate,
    String? imagePath,
    String? notes,
    DateTime? createdAt,
  }) {
    return GuaranteeCheck(
      id: id ?? this.id,
      storeName: storeName ?? this.storeName,
      productName: productName ?? this.productName,
      purchaseDate: purchaseDate ?? this.purchaseDate,
      expiryDate: expiryDate ?? this.expiryDate,
      imagePath: imagePath ?? this.imagePath,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  // Check if guarantee is expired
  bool get isExpired {
    final expiry = DateTime.parse(expiryDate);
    return DateTime.now().isAfter(expiry);
  }

  // Check if guarantee expires soon (within 30 days)
  bool get expiresSoon {
    final expiry = DateTime.parse(expiryDate);
    final thirtyDaysFromNow = DateTime.now().add(const Duration(days: 30));
    return expiry.isBefore(thirtyDaysFromNow) && !isExpired;
  }

  @override
  String toString() {
    return 'GuaranteeCheck(id: $id, storeName: $storeName, productName: $productName, purchaseDate: $purchaseDate, expiryDate: $expiryDate, imagePath: $imagePath, notes: $notes, createdAt: $createdAt)';
  }
}

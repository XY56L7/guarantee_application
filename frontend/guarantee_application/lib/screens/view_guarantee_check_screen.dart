import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import '../models/guarantee_check.dart';

class ViewGuaranteeCheckScreen extends StatelessWidget {
  final GuaranteeCheck guaranteeCheck;

  const ViewGuaranteeCheckScreen({
    super.key,
    required this.guaranteeCheck,
  });

  @override
  Widget build(BuildContext context) {
    final expiryDate = DateTime.parse(guaranteeCheck.expiryDate);
    final purchaseDate = DateTime.parse(guaranteeCheck.purchaseDate);
    final isExpired = guaranteeCheck.isExpired;
    final expiresSoon = guaranteeCheck.expiresSoon;

    Color statusColor;
    String statusText;
    IconData statusIcon;

    if (isExpired) {
      statusColor = Colors.red;
      statusText = 'Lejárt';
      statusIcon = Icons.warning;
    } else if (expiresSoon) {
      statusColor = Colors.orange;
      statusText = 'Hamarosan lejár';
      statusIcon = Icons.schedule;
    } else {
      statusColor = Colors.green;
      statusText = 'Érvényes';
      statusIcon = Icons.check_circle;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(guaranteeCheck.productName),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () => _shareGuaranteeCheck(context),
            tooltip: 'Megosztás',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status card
            Card(
              color: statusColor.withOpacity(0.1),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Icon(statusIcon, color: statusColor, size: 32),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            statusText,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: statusColor,
                            ),
                          ),
                          Text(
                            'Lejárat: ${DateFormat('yyyy.MM.dd').format(expiryDate)}',
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Image section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Garanciális számla Fotója',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    Center(
                      child: Container(
                        constraints: const BoxConstraints(maxHeight: 400),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: kIsWeb
                              ? Container(
                                  height: 200,
                                  decoration: BoxDecoration(
                                    color: Colors.grey[200],
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.image, size: 50, color: Colors.grey),
                                      SizedBox(height: 8),
                                      Text(
                                        'Kép megjelenítése weben\nnem támogatott',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                )
                              : Image.file(
                                  File(guaranteeCheck.imagePath),
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      height: 200,
                                      decoration: BoxDecoration(
                                        color: Colors.grey[200],
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(Icons.error, size: 50, color: Colors.grey),
                                          SizedBox(height: 8),
                                    Text('Nem sikerült betölteni a képet'),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Details section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Részletek',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 16),
                    _buildDetailRow('Üzlet', guaranteeCheck.storeName, Icons.store),
                    _buildDetailRow('Termék', guaranteeCheck.productName, Icons.shopping_bag),
                    _buildDetailRow('Vásárlás dátuma', DateFormat('yyyy.MM.dd').format(purchaseDate), Icons.calendar_today),
                    _buildDetailRow('Lejárat dátuma', DateFormat('yyyy.MM.dd').format(expiryDate), Icons.event),
                    _buildDetailRow('Hozzáadva', DateFormat('yyyy.MM.dd HH:mm').format(guaranteeCheck.createdAt), Icons.add_circle),
                    if (guaranteeCheck.notes != null && guaranteeCheck.notes!.isNotEmpty)
                      _buildDetailRow('Megjegyzések', guaranteeCheck.notes!, Icons.note),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Days remaining/overdue
            Card(
              color: isExpired ? Colors.red.withOpacity(0.1) : Colors.blue.withOpacity(0.1),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Icon(
                      isExpired ? Icons.warning : Icons.info,
                      color: isExpired ? Colors.red : Colors.blue,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        isExpired
                            ? 'A garancia ${DateTime.now().difference(expiryDate).inDays} nappal ezelőtt járt le'
                            : 'A garancia még ${expiryDate.difference(DateTime.now()).inDays} napig érvényes',
                        style: TextStyle(
                          color: isExpired ? Colors.red : Colors.blue,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _shareGuaranteeCheck(BuildContext context) {
    // This would implement sharing functionality
    // For now, just show a snackbar
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Megosztás funkció hamarosan elérhető')),
    );
  }
}

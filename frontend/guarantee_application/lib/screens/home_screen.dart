import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/guarantee_check.dart';
import '../database/database_helper.dart';
import '../services/dummy_data_service.dart';
import 'add_guarantee_check_screen.dart';
import 'view_guarantee_check_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final DatabaseHelper _databaseHelper = DatabaseHelper();
  final DummyDataService _dummyDataService = DummyDataService();
  List<GuaranteeCheck> _guaranteeChecks = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadGuaranteeChecks();
    _checkAndLoadDummyData();
  }

  Future<void> _checkAndLoadDummyData() async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    try {
      final checks = await _databaseHelper.getAllGuaranteeChecks();
      if (checks.isEmpty) {
        await _loadDummyData();
      }
    } catch (e) {
      await _loadDummyData();
    }
  }

  Future<void> _loadGuaranteeChecks() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final checks = await _databaseHelper.getAllGuaranteeChecks();
      setState(() {
        _guaranteeChecks = checks;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hiba a garanciális számla betöltésekor: $e')),
        );
      }
    }
  }

  Future<void> _searchGuaranteeChecks(String query) async {
    if (query.isEmpty) {
      await _loadGuaranteeChecks();
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final checks = await _databaseHelper.searchGuaranteeChecks(query);
      setState(() {
        _guaranteeChecks = checks;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hiba a keresés során: $e')),
        );
      }
    }
  }

  Future<void> _loadDummyData() async {
    try {
      await _dummyDataService.addDummyData();
      await _loadGuaranteeChecks();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Dummy adatok sikeresen hozzáadva')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hiba a dummy adatok hozzáadásakor: $e')),
        );
      }
    }
  }

  Future<void> _clearAllData() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Összes adat törlése'),
        content: const Text('Biztosan törölni szeretnéd az összes garanciális számlát? Ez a művelet nem vonható vissza!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Mégse'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Törlés', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _dummyDataService.clearDummyData();
        await _loadGuaranteeChecks();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Összes adat sikeresen törölve')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Hiba a törlés során: $e')),
          );
        }
      }
    }
  }

  Future<void> _deleteGuaranteeCheck(GuaranteeCheck check) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Garanciális számla törlése'),
        content: Text('Biztosan törölni szeretnéd a "${check.productName}" garanciális számlát?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Mégse'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Törlés'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _databaseHelper.deleteGuaranteeCheck(check.id!);
        await _loadGuaranteeChecks();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Garanciális számla sikeresen törölve')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Hiba a törlés során: $e')),
          );
        }
      }
    }
  }

  Widget _buildGuaranteeCheckCard(GuaranteeCheck check) {
    final expiryDate = DateTime.parse(check.expiryDate);
    final isExpired = check.isExpired;
    final expiresSoon = check.expiresSoon;

    Color statusColor;
    IconData statusIcon;

    if (isExpired) {
      statusColor = Colors.red;
      statusIcon = Icons.warning;
    } else if (expiresSoon) {
      statusColor = Colors.orange;
      statusIcon = Icons.schedule;
    } else {
      statusColor = Colors.green;
      statusIcon = Icons.check_circle;
    }

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withOpacity(0.1),
          child: Icon(
            statusIcon,
            color: statusColor,
          ),
        ),
        title: Text(
          check.productName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(check.storeName),
            Text(
              'Lejárat: ${DateFormat('yyyy.MM.dd').format(expiryDate)}',
              style: TextStyle(
                color: statusColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'view') {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ViewGuaranteeCheckScreen(guaranteeCheck: check),
                ),
              );
            } else if (value == 'delete') {
              _deleteGuaranteeCheck(check);
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'view',
              child: Row(
                children: [
                  Icon(Icons.visibility),
                  SizedBox(width: 8),
                  Text('Megtekintés'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  Icon(Icons.delete, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Törlés', style: TextStyle(color: Colors.red)),
                ],
              ),
            ),
          ],
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ViewGuaranteeCheckScreen(guaranteeCheck: check),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.receipt_long,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isEmpty ? 'Nincs garanciális számla' : 'Nincs találat',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchQuery.isEmpty 
                ? 'Kattints a + gombra az első garanciális számla hozzáadásához vagy használd a menüt dummy adatok betöltéséhez'
                : 'Próbálj más keresési kifejezést',
            style: TextStyle(
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
          if (_searchQuery.isEmpty) ...[
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loadDummyData,
              icon: const Icon(Icons.data_object),
              label: const Text('Dummy Adatok Betöltése'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Garanciális számlák'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'loadDummy') {
                _loadDummyData();
              } else if (value == 'clearAll') {
                _clearAllData();
              } else if (value == 'refresh') {
                _loadGuaranteeChecks();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'refresh',
                child: Row(
                  children: [
                    Icon(Icons.refresh),
                    SizedBox(width: 8),
                    Text('Frissítés'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'loadDummy',
                child: Row(
                  children: [
                    Icon(Icons.data_object, color: Colors.blue),
                    SizedBox(width: 8),
                    Text('Dummy Adatok Betöltése'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'clearAll',
                child: Row(
                  children: [
                    Icon(Icons.delete_forever, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Összes Adat Törlése'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          if (_guaranteeChecks.isNotEmpty)
            Container(
              margin: const EdgeInsets.all(16),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatItem(
                        'Összes',
                        _guaranteeChecks.length.toString(),
                        Icons.receipt_long,
                        Colors.blue,
                      ),
                      _buildStatItem(
                        'Lejárt',
                        _guaranteeChecks.where((c) => c.isExpired).length.toString(),
                        Icons.warning,
                        Colors.red,
                      ),
                      _buildStatItem(
                        'Hamarosan lejár',
                        _guaranteeChecks.where((c) => c.expiresSoon).length.toString(),
                        Icons.schedule,
                        Colors.orange,
                      ),
                      _buildStatItem(
                        'Érvényes',
                        _guaranteeChecks.where((c) => !c.isExpired && !c.expiresSoon).length.toString(),
                        Icons.check_circle,
                        Colors.green,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Keresés üzlet vagy termék szerint...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _searchQuery = '';
                          _loadGuaranteeChecks();
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
                _searchGuaranteeChecks(value);
              },
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _guaranteeChecks.isEmpty
                    ? _buildEmptyState()
                    : RefreshIndicator(
                        onRefresh: _loadGuaranteeChecks,
                        child: ListView.builder(
                          itemCount: _guaranteeChecks.length,
                          itemBuilder: (context, index) {
                            return _buildGuaranteeCheckCard(_guaranteeChecks[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const AddGuaranteeCheckScreen(),
            ),
          );
          if (result == true) {
            await _loadGuaranteeChecks();
          }
        },
        tooltip: 'Új garanciális számla',
        child: const Icon(Icons.add),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

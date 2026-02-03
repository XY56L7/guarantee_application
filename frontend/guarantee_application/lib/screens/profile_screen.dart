import 'package:flutter/material.dart';
import 'package:guarantee_application/services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String? _userName;
  String? _userEmail;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final profile = await ApiService.getProfile();
    
    if (profile != null && profile['success'] == true) {
      setState(() {
        _userName = profile['user']['name'];
        _userEmail = profile['user']['email'];
        _isLoading = false;
      });
    } else {
      _userName = await ApiService.getUserName();
      final storage = ApiService.storage;
      _userEmail = await storage.read(key: 'user_email');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          const SizedBox(height: 20),
          CircleAvatar(
            radius: 60,
            backgroundColor: Theme.of(context).primaryColor.withOpacity(0.2),
            child: Icon(
              Icons.person,
              size: 60,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            _userName ?? 'User',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            _userEmail ?? 'email@example.com',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 40),
          _buildInfoCard(
            icon: Icons.verified_user,
            title: 'Account Status',
            subtitle: 'Active',
            color: Colors.green,
          ),
          const SizedBox(height: 16),
          _buildInfoCard(
            icon: Icons.shield,
            title: 'Security',
            subtitle: 'JWT Token Protected',
            color: Colors.blue,
          ),
          const SizedBox(height: 16),
          _buildInfoCard(
            icon: Icons.cloud,
            title: 'Backend',
            subtitle: 'Connected',
            color: Colors.purple,
          ),
          const SizedBox(height: 32),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('About'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showAboutDialog(
                context: context,
                applicationName: 'Guarantee App',
                applicationVersion: '1.0.0',
                children: const [
                  Text('Secure guarantee management application with JWT authentication.'),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Card(
      elevation: 2,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.2),
          child: Icon(icon, color: color),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(subtitle),
      ),
    );
  }
}



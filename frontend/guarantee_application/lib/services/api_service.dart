import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'http_client_stub.dart' if (dart.library.html) 'http_client_web.dart' as http_client;
import 'web_storage_stub.dart' if (dart.library.html) 'web_storage.dart';

class ApiService {
  static const storage = FlutterSecureStorage();
  static final WebStorage _webStorage = WebStorage();

  static http.Client? _client;
  static http.Client get _httpClient {
    _client ??= http_client.createHttpClient();
    return _client!;
  }

  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000/api';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api';
    } else {
      return 'http://localhost:3000/api';
    }
  }

  static const _webSessionKey = 'session_active';
  static const _webUserEmailKey = 'user_email';
  static const _webUserNameKey = 'user_name';
  static const _webUserIdKey = 'user_id';

  static Future<bool> _writeToken(String key, String value) async {
    if (kIsWeb) {
      return true;
    }
    try {
      await storage.write(key: key, value: value);
      return true;
    } catch (_) {
      return false;
    }
  }

  static Future<String?> _readToken(String key) async {
    if (kIsWeb) {
      return null;
    }
    return await storage.read(key: key);
  }

  static Future<void> _deleteToken(String key) async {
    if (!kIsWeb) {
      await storage.delete(key: key);
    }
  }

  static Future<void> _setWebSession(Map<String, dynamic> user) async {
    if (!kIsWeb) return;
    try {
      _webStorage[_webSessionKey] = '1';
      _webStorage[_webUserEmailKey] = user['email']?.toString() ?? '';
      _webStorage[_webUserNameKey] = user['name']?.toString() ?? '';
      _webStorage[_webUserIdKey] = user['id']?.toString() ?? '';
    } catch (_) {
    }
  }

  static Future<void> _clearWebSession() async {
    if (!kIsWeb) return;
    try {
      _webStorage.remove(_webSessionKey);
      _webStorage.remove(_webUserEmailKey);
      _webStorage.remove(_webUserNameKey);
      _webStorage.remove(_webUserIdKey);
    } catch (_) {
    }
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          data['success'] == true) {
        final user = data['user'] as Map<String, dynamic>? ?? {};
        if (kIsWeb) {
          await _setWebSession(user);
          return data;
        }
        final accessToken = data['accessToken'] as String? ?? data['token'] as String?;
        final refreshToken = data['refreshToken'] as String?;
        if (accessToken == null || accessToken.isEmpty) {
          return {'success': false, 'message': 'No token in response'};
        }
        final tokenSaved = await _writeToken('jwt_token', accessToken);
        if (refreshToken != null && refreshToken.isNotEmpty) {
          await _writeToken('refresh_token', refreshToken);
        }
        await _writeToken('user_email', user['email']?.toString() ?? '');
        await _writeToken('user_name', user['name']?.toString() ?? '');
        await _writeToken('user_id', user['id']?.toString() ?? '');
        if (!tokenSaved) {
          return {
            'success': false,
            'message': 'Login successful but token could not be saved',
          };
        }
      }
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  static Future<Map<String, dynamic>> signup(
      String email, String password, String name) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('$baseUrl/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'name': name,
        }),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          data['success'] == true) {
        final user = data['user'] as Map<String, dynamic>? ?? {};
        if (kIsWeb) {
          await _setWebSession(user);
          return data;
        }
        final accessToken = data['accessToken'] as String? ?? data['token'] as String?;
        final refreshToken = data['refreshToken'] as String?;
        if (accessToken == null || accessToken.isEmpty) {
          return {'success': false, 'message': 'No token in response'};
        }
        final tokenSaved = await _writeToken('jwt_token', accessToken);
        if (refreshToken != null && refreshToken.isNotEmpty) {
          await _writeToken('refresh_token', refreshToken);
        }
        await _writeToken('user_email', user['email']?.toString() ?? '');
        await _writeToken('user_name', user['name']?.toString() ?? '');
        await _writeToken('user_id', user['id']?.toString() ?? '');
        if (!tokenSaved) {
          return {
            'success': false,
            'message': 'Signup successful but token could not be saved',
          };
        }
      }
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  static Future<Map<String, dynamic>?> getProfile() async {
    try {
      if (kIsWeb) {
        final response = await _httpClient.get(
          Uri.parse('$baseUrl/users/profile'),
          headers: {'Content-Type': 'application/json'},
        );
        if (response.statusCode == 200) {
          return jsonDecode(response.body) as Map<String, dynamic>;
        }
        if (response.statusCode == 401) {
          await logout();
          return null;
        }
        return null;
      }
      final token = await _readToken('jwt_token');
      if (token == null) return null;
      final response = await _httpClient.get(
        Uri.parse('$baseUrl/users/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      if (response.statusCode == 401) {
        await logout();
        return null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  static Future<bool> isLoggedIn() async {
    if (kIsWeb) {
      try {
        final session = _webStorage[_webSessionKey];
        return session == '1';
      } catch (_) {
        return false;
      }
    }
    final token = await _readToken('jwt_token');
    return token != null && token.isNotEmpty;
  }

  static Future<String?> getToken() async {
    return await _readToken('jwt_token');
  }

  static Future<String?> getUserName() async {
    if (kIsWeb) {
      try {
        return _webStorage[_webUserNameKey];
      } catch (_) {
        return null;
      }
    }
    return await _readToken('user_name');
  }

  static Future<void> logout() async {
    if (kIsWeb) {
      try {
        await _httpClient.post(
          Uri.parse('$baseUrl/auth/logout'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({}),
        );
      } catch (_) {
      }
      await _clearWebSession();
      return;
    }
    final refreshToken = await _readToken('refresh_token');
    final accessToken = await _readToken('jwt_token');
    try {
      await _httpClient.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: {
          'Content-Type': 'application/json',
          if (accessToken != null) 'Authorization': 'Bearer $accessToken',
        },
        body: jsonEncode({'refreshToken': refreshToken ?? ''}),
      );
    } catch (_) {
    }
    await _deleteToken('jwt_token');
    await _deleteToken('refresh_token');
    await _deleteToken('user_email');
    await _deleteToken('user_name');
    await _deleteToken('user_id');
  }
}

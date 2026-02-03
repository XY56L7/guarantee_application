import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'web_storage_stub.dart' if (dart.library.html) 'web_storage.dart';

class ApiService {
  static const storage = FlutterSecureStorage();
  static SharedPreferences? _prefs;
  static final WebStorage _webStorage = WebStorage();
  
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000/api';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api';
    } else {
      return 'http://localhost:3000/api';
    }
  }

  static Future<void> _initPrefs() async {
    if (kIsWeb) {
      if (_prefs == null) {
        try {
          _prefs = await SharedPreferences.getInstance();
        } catch (_) {
        }
      }
    }
  }

  static Future<bool> _writeToken(String key, String value) async {
    if (kIsWeb) {
      try {
        _webStorage[key] = value;
        await Future.delayed(const Duration(milliseconds: 50));
        final savedValue = _webStorage[key];
        final isSaved = savedValue == value;
        return isSaved;
      } catch (_) {
        try {
          await _initPrefs();
          if (_prefs != null) {
            await _prefs!.setString(key, value);
            return true;
          }
        } catch (_) {
        }
        return false;
      }
    } else {
      try {
        await storage.write(key: key, value: value);
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  static Future<String?> _readToken(String key) async {
    if (kIsWeb) {
      try {
        final value = _webStorage[key];
        return value;
      } catch (_) {
        try {
          await _initPrefs();
          return _prefs?.getString(key);
        } catch (_) {
          return null;
        }
      }
    } else {
      return await storage.read(key: key);
    }
  }

  // ignore: unused_element
  static Future<void> _deleteToken(String key) async {
    if (kIsWeb) {
      try {
        _webStorage.remove(key);
      } catch (_) {
        try {
          await _initPrefs();
          await _prefs?.remove(key);
        } catch (_) {
        }
      }
    } else {
      await storage.delete(key: key);
    }
  }
  
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);
      
      if ((response.statusCode == 200 || response.statusCode == 201) && data['success'] == true) {
        final tokenSaved = await _writeToken('jwt_token', data['token']);
        await _writeToken('user_email', data['user']['email']);
        await _writeToken('user_name', data['user']['name']);
        await _writeToken('user_id', data['user']['id'].toString());
        
        if (kIsWeb) {
          await Future.delayed(const Duration(milliseconds: 200));
        }
        
        final verifyToken = await _readToken('jwt_token');
        
        if (!tokenSaved || verifyToken == null) {
          return {
            'success': false,
            'message': 'Login successful but token could not be saved'
          };
        }
      }
      
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}'
      };
    }
  }

  static Future<Map<String, dynamic>> signup(String email, String password, String name) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'name': name,
        }),
      );

      final data = jsonDecode(response.body);
      
      if (response.statusCode == 201 && data['success'] == true) {
        final tokenSaved = await _writeToken('jwt_token', data['token']);
        await _writeToken('user_email', data['user']['email']);
        await _writeToken('user_name', data['user']['name']);
        await _writeToken('user_id', data['user']['id'].toString());
        
        if (kIsWeb) {
          await Future.delayed(const Duration(milliseconds: 200));
        }
        
        if (!tokenSaved) {
          return {
            'success': false,
            'message': 'Signup successful but token could not be saved'
          };
        }
      }
      
      return data;
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}'
      };
    }
  }
  
  static Future<Map<String, dynamic>?> getProfile() async {
    try {
      final token = await _readToken('jwt_token');
      
      if (token == null) return null;

      final response = await http.get(
        Uri.parse('$baseUrl/auth/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else if (response.statusCode == 401) {
        await logout();
        return null;
      }
      
      return null;
    } catch (e) {
      return null;
    }
  }
  
  static Future<bool> isLoggedIn() async {
    final token = await _readToken('jwt_token');
    return token != null && token.isNotEmpty;
  }
  
  static Future<String?> getToken() async {
    return await _readToken('jwt_token');
  }
  
  static Future<String?> getUserName() async {
    return await _readToken('user_name');
  }
  
  static Future<void> logout() async {
    if (kIsWeb) {
      try {
        _webStorage.clear();
      } catch (_) {
        try {
          await _initPrefs();
          await _prefs?.clear();
        } catch (_) {
        }
      }
    } else {
      await storage.deleteAll();
    }
  }
}



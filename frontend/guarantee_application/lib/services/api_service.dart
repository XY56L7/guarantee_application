import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const storage = FlutterSecureStorage();
  
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000/api';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api';
    } else {
      return 'http://localhost:3000/api';
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
      
      if (response.statusCode == 200 && data['success'] == true) {
        await storage.write(key: 'jwt_token', value: data['token']);
        await storage.write(key: 'user_email', value: data['user']['email']);
        await storage.write(key: 'user_name', value: data['user']['name']);
        await storage.write(key: 'user_id', value: data['user']['id'].toString());
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
        await storage.write(key: 'jwt_token', value: data['token']);
        await storage.write(key: 'user_email', value: data['user']['email']);
        await storage.write(key: 'user_name', value: data['user']['name']);
        await storage.write(key: 'user_id', value: data['user']['id'].toString());
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
      final token = await storage.read(key: 'jwt_token');
      
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
    final token = await storage.read(key: 'jwt_token');
    return token != null;
  }
  
  static Future<String?> getToken() async {
    return await storage.read(key: 'jwt_token');
  }
  
  static Future<String?> getUserName() async {
    return await storage.read(key: 'user_name');
  }
  
  static Future<void> logout() async {
    await storage.deleteAll();
  }
}



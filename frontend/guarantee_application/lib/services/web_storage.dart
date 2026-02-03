// Web implementation using dart:html (only imported on web)
// ignore_for_file: avoid_web_libraries_in_flutter
import 'dart:html' as html;

class WebStorage {
  String? operator [](String key) => html.window.localStorage[key];
  void operator []=(String key, String value) {
    html.window.localStorage[key] = value;
  }
  void remove(String key) => html.window.localStorage.remove(key);
  void clear() => html.window.localStorage.clear();
}

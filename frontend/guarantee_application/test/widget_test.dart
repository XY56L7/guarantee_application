import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Smoke test: MaterialApp pumps without error',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Center(child: Text('Guarantee App')),
        ),
      ),
    );
    expect(find.byType(MaterialApp), findsOneWidget);
    expect(find.text('Guarantee App'), findsOneWidget);
  });
}

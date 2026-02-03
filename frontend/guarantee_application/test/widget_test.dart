import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:guarantee_application/main.dart';

void main() {
  testWidgets('App pumps without error', (WidgetTester tester) async {
    await tester.pumpWidget(const GuaranteeApp());
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}

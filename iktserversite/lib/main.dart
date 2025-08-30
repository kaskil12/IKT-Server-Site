import 'package:flutter/material.dart';

void main() {
  runApp(
    MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Text("My Title"),
          backgroundColor: Color.fromARGB(255, 0, 255, 85),
        ),
        body: Center(
          child: Text(
            "HELLO",
            style: TextStyle(fontSize: 200, color: Colors.red),
          ),
        ),
      ),
    ),
  );
}

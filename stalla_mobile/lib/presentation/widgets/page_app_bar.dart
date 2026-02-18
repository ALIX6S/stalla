import 'package:flutter/material.dart';

AppBar buildPageAppBar(String title) {
  return AppBar(
    title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
    centerTitle: true,
    backgroundColor: Colors.transparent,
    elevation: 0,
    foregroundColor: Colors.black,
  );
}

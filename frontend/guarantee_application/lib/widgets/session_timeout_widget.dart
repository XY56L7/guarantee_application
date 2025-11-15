import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SessionTimeoutWidget extends StatefulWidget {
  final Widget child;
  final Duration timeoutDuration;
  final VoidCallback onTimeout;

  const SessionTimeoutWidget({
    super.key,
    required this.child,
    this.timeoutDuration = const Duration(minutes: 15),
    required this.onTimeout,
  });

  @override
  State<SessionTimeoutWidget> createState() => _SessionTimeoutWidgetState();
}

class _SessionTimeoutWidgetState extends State<SessionTimeoutWidget> {
  Timer? _timer;
  int _remainingSeconds = 0;
  bool _showWarning = false;

  @override
  void initState() {
    super.initState();
    _resetTimer();
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _remainingSeconds = widget.timeoutDuration.inSeconds;
      _showWarning = false;
    });
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
          _showWarning = _remainingSeconds <= 60;
        });
      } else {
        _handleTimeout();
      }
    });
  }

  Future<void> _handleTimeout() async {
    _timer?.cancel();
    await ApiService.logout();
    widget.onTimeout();
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  Color _getTimerColor() {
    if (_remainingSeconds <= 60) {
      return Colors.red;
    } else if (_remainingSeconds <= 300) {
      return Colors.orange;
    }
    return Colors.grey;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _resetTimer,
      onPanDown: (_) => _resetTimer(),
      behavior: HitTestBehavior.translucent,
      child: Stack(
        children: [
          widget.child,
          Positioned(
            top: 8,
            left: 16,
            child: SafeArea(
              child: AnimatedOpacity(
                opacity: _showWarning ? 1.0 : 0.7,
                duration: const Duration(milliseconds: 300),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                    border: Border.all(
                      color: _getTimerColor(),
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _showWarning ? Icons.warning : Icons.timer,
                        color: _getTimerColor(),
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _formatTime(_remainingSeconds),
                        style: TextStyle(
                          color: _getTimerColor(),
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}


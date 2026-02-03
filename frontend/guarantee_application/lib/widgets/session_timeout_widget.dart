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
  final ValueNotifier<int> _remainingSecondsNotifier = ValueNotifier<int>(0);
  final ValueNotifier<bool> _showWarningNotifier = ValueNotifier<bool>(false);

  @override
  void initState() {
    super.initState();
    _resetTimer();
  }

  void _resetTimer() {
    _timer?.cancel();
    _remainingSecondsNotifier.value = widget.timeoutDuration.inSeconds;
    _showWarningNotifier.value = false;
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final currentSeconds = _remainingSecondsNotifier.value;
      if (currentSeconds > 0) {
        final newRemainingSeconds = currentSeconds - 1;
        final newShowWarning = newRemainingSeconds <= 60;
        final shouldUpdate = newShowWarning != _showWarningNotifier.value || 
                            (newRemainingSeconds > 60 && newRemainingSeconds % 10 == 0) ||
                            newRemainingSeconds <= 60;
        
        if (shouldUpdate) {
          _remainingSecondsNotifier.value = newRemainingSeconds;
          _showWarningNotifier.value = newShowWarning;
        } else {
          _remainingSecondsNotifier.value = newRemainingSeconds;
        }
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

  Color _getTimerColor(int seconds) {
    if (seconds <= 60) {
      return Colors.red;
    } else if (seconds <= 300) {
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
              child: RepaintBoundary(
                child: ValueListenableBuilder<bool>(
                  valueListenable: _showWarningNotifier,
                  builder: (context, showWarning, _) {
                    return ValueListenableBuilder<int>(
                      valueListenable: _remainingSecondsNotifier,
                      builder: (context, remainingSeconds, _) {
                        return AnimatedOpacity(
                          opacity: showWarning ? 1.0 : 0.7,
                          duration: const Duration(milliseconds: 300),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.transparent,
                              border: Border.all(
                                color: _getTimerColor(remainingSeconds),
                                width: 2,
                              ),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  showWarning ? Icons.warning : Icons.timer,
                                  color: _getTimerColor(remainingSeconds),
                                  size: 16,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  _formatTime(remainingSeconds),
                                  style: TextStyle(
                                    color: _getTimerColor(remainingSeconds),
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  },
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
    _remainingSecondsNotifier.dispose();
    _showWarningNotifier.dispose();
    super.dispose();
  }
}


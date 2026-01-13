import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;
import '../models/guarantee_check.dart';
import '../database/database_helper.dart';
import '../services/ocr_service.dart';
import '../services/guarantee_validation_service.dart';

class AddGuaranteeCheckScreen extends StatefulWidget {
  const AddGuaranteeCheckScreen({super.key});

  @override
  State<AddGuaranteeCheckScreen> createState() => _AddGuaranteeCheckScreenState();
}

class _AddGuaranteeCheckScreenState extends State<AddGuaranteeCheckScreen> {
  final _formKey = GlobalKey<FormState>();
  final _storeNameController = TextEditingController();
  final _productNameController = TextEditingController();
  final _notesController = TextEditingController();
  
  final DatabaseHelper _databaseHelper = DatabaseHelper();
  final ImagePicker _picker = ImagePicker();
  final OCRService _ocrService = OCRService();
  final GuaranteeValidationService _validationService = GuaranteeValidationService();
  
  File? _selectedImage;
  Uint8List? _selectedImageBytes; // Web platformon használjuk
  DateTime? _purchaseDate;
  DateTime? _expiryDate;
  bool _isLoading = false;
  bool _isProcessingOCR = false;
  String? _extractedText;
  GuaranteeValidationResult? _validationResult;

  @override
  void dispose() {
    _storeNameController.dispose();
    _productNameController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          if (kIsWeb) {
            // Web platformon bytes-ot tárolunk
            image.readAsBytes().then((bytes) {
              setState(() {
                _selectedImageBytes = bytes;
              });
            });
            _selectedImage = null;
          } else {
            _selectedImage = File(image.path);
            _selectedImageBytes = null;
          }
          _extractedText = null;
          _validationResult = null;
        });
        
        // Process OCR automatically
        await _processOCR();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hiba a kép kiválasztásakor: $e')),
        );
      }
    }
  }

  Future<void> _processOCR() async {
    if (_selectedImage == null) return;

    setState(() {
      _isProcessingOCR = true;
    });

    try {
      // Extract text blocks
      final textBlocks = await _ocrService.extractTextBlocks(_selectedImage!);
      
      // Extract full text
      final fullText = await _ocrService.extractTextFromImage(_selectedImage!);
      
      // Validate guarantee
      final validationResult = await _validationService.validateGuaranteeText(textBlocks);
      
      setState(() {
        _extractedText = fullText;
        _validationResult = validationResult;
        _isProcessingOCR = false;
      });

      // Auto-fill form fields if validation was successful
      if (validationResult.isValid) {
        _autoFillForm(validationResult);
      }

      // Show warnings or exclusions
      if (validationResult.isExcluded) {
        _showExclusionDialog(validationResult);
      } else if (validationResult.warnings.isNotEmpty) {
        _showWarningDialog(validationResult);
      }

    } catch (e) {
      setState(() {
        _isProcessingOCR = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hiba a szöveg felismerése során: $e')),
        );
      }
    }
  }

  void _autoFillForm(GuaranteeValidationResult result) {
    if (result.extractedStoreName != null) {
      _storeNameController.text = result.extractedStoreName!;
    }
    if (result.extractedProductName != null) {
      _productNameController.text = result.extractedProductName!;
    }
    // Note: Dates would need more complex parsing to convert to DateTime
  }

  void _showExclusionDialog(GuaranteeValidationResult result) {
    final exclusionReasons = _validationService.getExclusionReasons(result.exclusions);
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning, color: Colors.red),
            SizedBox(width: 8),
            Text('Garancia Kizárva!'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Ez a garanciális számla kizárva van és nem használható:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...exclusionReasons.map((reason) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.close, color: Colors.red, size: 16),
                  const SizedBox(width: 8),
                  Expanded(child: Text(reason)),
                ],
              ),
            )),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Rendben'),
          ),
        ],
      ),
    );
  }

  void _showWarningDialog(GuaranteeValidationResult result) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.info, color: Colors.orange),
            SizedBox(width: 8),
            Text('Figyelmeztetés'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'A garanciális számlák talált figyelmeztetések:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...result.warnings.map((warning) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline, color: Colors.orange, size: 16),
                  const SizedBox(width: 8),
                  Expanded(child: Text(warning)),
                ],
              ),
            )),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Rendben'),
          ),
        ],
      ),
    );
  }

  Future<String> _saveImageToAppDirectory(File imageFile) async {
    try {
      if (kIsWeb) {
        // Web platformon nem mentünk fájlt, csak egy placeholder path-et használunk
        // A kép valójában memóriában marad vagy base64 stringként tárolható
        return 'web_image_${DateTime.now().millisecondsSinceEpoch}.jpg';
      }
      final Directory appDir = await getApplicationDocumentsDirectory();
      final String fileName = 'guarantee_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final String filePath = path.join(appDir.path, 'guarantee_images', fileName);
      
      // Create directory if it doesn't exist
      final Directory imageDir = Directory(path.dirname(filePath));
      if (!await imageDir.exists()) {
        await imageDir.create(recursive: true);
      }
      
      // Copy the image to the app directory
      final File savedImage = await imageFile.copy(filePath);
      return savedImage.path;
    } catch (e) {
      throw Exception('Hiba a kép mentésekor: $e');
    }
  }

  Future<void> _selectDate(BuildContext context, bool isPurchaseDate) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isPurchaseDate 
          ? (_purchaseDate ?? DateTime.now())
          : (_expiryDate ?? DateTime.now().add(const Duration(days: 365))),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );

    if (picked != null) {
      setState(() {
        if (isPurchaseDate) {
          _purchaseDate = picked;
        } else {
          _expiryDate = picked;
        }
      });
    }
  }

  Future<void> _saveGuaranteeCheck() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Kérjük, készítsen képet a garanciális számláról')),
      );
      return;
    }

    if (_purchaseDate == null || _expiryDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Kérjük, válassza ki a vásárlás és lejárat dátumát')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Save image to app directory
      final String imagePath = await _saveImageToAppDirectory(_selectedImage!);

      // Create guarantee check object
      final guaranteeCheck = GuaranteeCheck(
        storeName: _storeNameController.text.trim(),
        productName: _productNameController.text.trim(),
        purchaseDate: DateFormat('yyyy-MM-dd').format(_purchaseDate!),
        expiryDate: DateFormat('yyyy-MM-dd').format(_expiryDate!),
        imagePath: imagePath,
        notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
        createdAt: DateTime.now(),
      );

      // Save to database
      await _databaseHelper.insertGuaranteeCheck(guaranteeCheck);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Garanciális számla sikeresen mentve')),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hiba a mentés során: $e')),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Új Garanciális számla'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            TextButton(
              onPressed: _saveGuaranteeCheck,
              child: const Text(
                'Mentés',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Image picker section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const Text(
                        'Garanciális számla Fotója',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      if (_selectedImage != null || _selectedImageBytes != null)
                        Stack(
                          children: [
                            Container(
                              height: 200,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: kIsWeb && _selectedImageBytes != null
                                    ? Image.memory(
                                        _selectedImageBytes!,
                                        fit: BoxFit.cover,
                                      )
                                    : _selectedImage != null
                                        ? Image.file(
                                            _selectedImage!,
                                            fit: BoxFit.cover,
                                          )
                                        : const SizedBox(),
                              ),
                            ),
                            if (_isProcessingOCR)
                              Container(
                                height: 200,
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(8),
                                  color: Colors.black54,
                                ),
                                child: const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    CircularProgressIndicator(color: Colors.white),
                                    SizedBox(height: 8),
                                    Text(
                                      'Szöveg felismerése...',
                                      style: TextStyle(color: Colors.white),
                                    ),
                                  ],
                                ),
                              ),
                            if (_validationResult != null && !_isProcessingOCR)
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _validationResult!.isExcluded 
                                        ? Colors.red 
                                        : _validationResult!.warnings.isNotEmpty 
                                            ? Colors.orange 
                                            : Colors.green,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        _validationResult!.isExcluded 
                                            ? Icons.close 
                                            : _validationResult!.warnings.isNotEmpty 
                                                ? Icons.warning 
                                                : Icons.check,
                                        color: Colors.white,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        _validationResult!.isExcluded 
                                            ? 'Kizárva' 
                                            : _validationResult!.warnings.isNotEmpty 
                                                ? 'Figyelmeztetés' 
                                                : 'Érvényes',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        )
                      else
                        Container(
                          height: 200,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey, style: BorderStyle.solid),
                          ),
                          child: const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.camera_alt, size: 50, color: Colors.grey),
                              SizedBox(height: 8),
                              Text('Nincs kép kiválasztva'),
                            ],
                          ),
                        ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _pickImage,
                              icon: const Icon(Icons.camera_alt),
                              label: const Text('Kép Készítése'),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                              ),
                            ),
                          ),
                          if (_selectedImage != null && !_isProcessingOCR) ...[
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: _processOCR,
                                icon: const Icon(Icons.text_fields),
                                label: const Text('Szöveg Felismerése'),
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                  backgroundColor: Colors.blue,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // OCR Results Section
              if (_extractedText != null)
                Card(
                  color: _validationResult?.isExcluded == true 
                      ? Colors.red.withOpacity(0.1)
                      : _validationResult?.warnings.isNotEmpty == true
                          ? Colors.orange.withOpacity(0.1)
                          : Colors.green.withOpacity(0.1),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              _validationResult?.isExcluded == true 
                                  ? Icons.warning 
                                  : _validationResult?.warnings.isNotEmpty == true
                                      ? Icons.info
                                      : Icons.check_circle,
                              color: _validationResult?.isExcluded == true 
                                  ? Colors.red 
                                  : _validationResult?.warnings.isNotEmpty == true
                                      ? Colors.orange
                                      : Colors.green,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _validationResult?.isExcluded == true 
                                  ? 'Garancia Kizárva' 
                                  : _validationResult?.warnings.isNotEmpty == true
                                      ? 'Figyelmeztetések'
                                      : 'Garancia Érvényes',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: _validationResult?.isExcluded == true 
                                    ? Colors.red 
                                    : _validationResult?.warnings.isNotEmpty == true
                                        ? Colors.orange
                                        : Colors.green,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Felismert szöveg:',
                          style: TextStyle(fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey[300]!),
                          ),
                          child: Text(
                            _extractedText!,
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 16),

              // Store name field
              TextFormField(
                controller: _storeNameController,
                decoration: const InputDecoration(
                  labelText: 'Üzlet Neve',
                  hintText: 'pl. MediaMarkt, IKEA',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Kérjük, adja meg az üzlet nevét';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Product name field
              TextFormField(
                controller: _productNameController,
                decoration: const InputDecoration(
                  labelText: 'Termék Neve',
                  hintText: 'pl. Samsung Galaxy S23',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Kérjük, adja meg a termék nevét';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Purchase date field
              InkWell(
                onTap: () => _selectDate(context, true),
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Vásárlás Dátuma',
                    border: OutlineInputBorder(),
                    suffixIcon: Icon(Icons.calendar_today),
                  ),
                  child: Text(
                    _purchaseDate != null
                        ? DateFormat('yyyy.MM.dd').format(_purchaseDate!)
                        : 'Válasszon dátumot',
                    style: TextStyle(
                      color: _purchaseDate != null ? null : Colors.grey[600],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Expiry date field
              InkWell(
                onTap: () => _selectDate(context, false),
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Lejárat Dátuma',
                    border: OutlineInputBorder(),
                    suffixIcon: Icon(Icons.calendar_today),
                  ),
                  child: Text(
                    _expiryDate != null
                        ? DateFormat('yyyy.MM.dd').format(_expiryDate!)
                        : 'Válasszon dátumot',
                    style: TextStyle(
                      color: _expiryDate != null ? null : Colors.grey[600],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Notes field
              TextFormField(
                controller: _notesController,
                decoration: const InputDecoration(
                  labelText: 'Megjegyzések (opcionális)',
                  hintText: 'További információk...',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 24),

              // Save button
              ElevatedButton(
                onPressed: _isLoading ? null : _saveGuaranteeCheck,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text(
                        'Garanciális számla Mentése',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

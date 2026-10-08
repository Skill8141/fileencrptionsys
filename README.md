# Authenticated File Encryption System

## Introduction

The **Authenticated File Encryption System** is a web-based application for securely encrypting and decrypting files using **AES-256-GCM** authenticated encryption.

The application protects files in two important ways:

- **Confidentiality:** the file contents are encrypted so they cannot be read without the correct key.
- **Integrity and authentication:** AES-GCM detects whether the encrypted data has been modified or whether an incorrect key was supplied.

The user selects a file, enters a secret key, and encrypts it. The application uses **PBKDF2-HMAC-SHA256** to derive a 256-bit encryption key and then encrypts the file using AES-256-GCM. The encrypted JSON data can be viewed directly in the GUI and downloaded as an `.enc` file.

During decryption, the user uploads the `.enc` file and enters the same key. If authentication succeeds, the original file can be downloaded. If the key is incorrect or the encrypted file has been tampered with, decryption is rejected.

### Main Features

- AES-256-GCM authenticated encryption
- PBKDF2-HMAC-SHA256 key derivation
- Random salt and nonce for every encryption
- File encryption and decryption
- Encrypted data preview in the GUI
- Download encrypted `.enc` files
- Download decrypted original files
- Tampering detection
- Wrong-key detection
- Simple web interface
- No user registration or login required

---

# 1. Requirements

Install the following before running the project:

1. **Python 3.10 or newer**
2. **pip** (Python package manager)
3. **Git** (only if the project is obtained from Git)
4. A modern web browser such as Chrome, Edge, or Firefox

### Python packages

The project uses:

- Flask
- cryptography

They can be installed using `requirements.txt`.

---

# 2. Project Structure

```text
fileencrptionsys/
│
├── app.py
│
├── encryption/
│   ├── __init__.py
│   └── crypto.py
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
├── requirements.txt
├── README.md
│
└── venv/
```

`venv` is the local Python virtual environment.

---

# 3. Installation

## Step 1: Open the project folder

Open PowerShell or Command Prompt:

```powershell
cd C:\Users\Skill\Desktop\fileencrptionsys
```

If your project is in another location, use that path instead.

## Step 2: Create a virtual environment

```powershell
python -m venv venv
```

## Step 3: Activate the virtual environment

### PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

### Command Prompt

```cmd
venv\Scripts\activate
```

You should see `(venv)` at the beginning of the terminal prompt.

## Step 4: Install dependencies

If `requirements.txt` exists:

```powershell
pip install -r requirements.txt
```

Or install the packages manually:

```powershell
pip install flask cryptography
```

---

# 4. Run the Application

Make sure the virtual environment is activated.

From the project folder, run:

```powershell
python app.py
```

You should see something similar to:

```text
* Running on http://127.0.0.1:5000
```

Keep this terminal open while using the application.

---

# 5. Open the Application

Open a web browser and visit:

```text
http://127.0.0.1:5000
```

The **Authenticated File Encryption System** interface will appear.

To stop the server, press:

```text
Ctrl + C
```

---

# 6. How to Use the Application

## 6.1 Encrypt a File

### Step 1 — Select a file

In the **Encrypt File** section:

1. Click **Drop file or click to browse**.
2. Select the file you want to encrypt.
3. The filename and file size will appear.

### Step 2 — Enter a key

Enter a secret key in **Encryption Key**.

Example:

```text
MySecureKey123!
```

Remember this key. You need the same key to decrypt the file.

### Step 3 — Encrypt

Click:

```text
Encrypt File
```

The backend will:

1. Generate a random salt.
2. Derive a 256-bit key using PBKDF2-HMAC-SHA256.
3. Generate a random nonce.
4. Encrypt the file using AES-256-GCM.
5. Create the encrypted JSON package.
6. Return the encrypted data to the GUI.

### Step 4 — View encrypted data

The **Encrypted Data** section will appear and show the encrypted JSON package.

It contains metadata such as:

- Encryption algorithm
- Key derivation method
- PBKDF2 iteration count
- Salt
- Nonce
- Original filename
- MIME type
- Ciphertext

The file contents are encrypted and the ciphertext is represented using Base64.

### Step 5 — Download

Click:

```text
Download .enc File
```

The encrypted file will be downloaded, for example:

```text
example.txt.enc
```

---

# 7. Decrypt a File

## Step 1 — Select the encrypted file

In the **Decrypt File** section:

1. Click **Drop .enc file or click to browse**.
2. Select the `.enc` file.

## Step 2 — Enter the original key

Enter the same key used during encryption.

Example:

```text
MySecureKey123!
```

## Step 3 — Decrypt

Click:

```text
Decrypt File
```

The application will:

1. Read the encrypted package.
2. Extract the salt and nonce.
3. Derive the key from the supplied password.
4. Verify the AES-GCM authentication tag.
5. Decrypt the ciphertext.
6. Restore the original file data.

## Step 4 — Download the original file

After successful decryption, click:

```text
Download Original File
```

The original file will be downloaded using its original filename.

---

# 8. Test Tampering Detection

The project can demonstrate authenticated encryption by detecting modified encrypted data.

1. Encrypt a file.
2. Download the `.enc` file.
3. Open the `.enc` file in a text editor.
4. Change a character in the encrypted data.
5. Save the modified file.
6. Upload it in the **Decrypt File** section.
7. Enter the correct key.
8. Click **Decrypt File**.

The application should reject the modified file with an error similar to:

```text
Authentication failed: incorrect key or file has been tampered with.
```

This demonstrates the integrity protection provided by AES-GCM.

---

# 9. Test an Incorrect Key

You can also test wrong-key protection:

1. Encrypt a file.
2. Upload the `.enc` file.
3. Enter an incorrect key.
4. Click **Decrypt File**.

Authentication should fail and the original file should not be returned.

---

# 10. Security Technologies

## AES-256-GCM

AES-256-GCM is the main encryption algorithm.

- AES = Advanced Encryption Standard
- 256-bit encryption key
- GCM = Galois/Counter Mode

GCM provides both encryption and authentication.

## PBKDF2-HMAC-SHA256

The user supplies a password rather than a raw AES key.

PBKDF2-HMAC-SHA256 derives the AES key from that password using:

```text
600,000 iterations
```

and a random 16-byte salt.

## Random Salt

A new random salt is generated for every encryption operation.

## Random Nonce

A new random 12-byte nonce is generated for every encryption operation.

## Authentication Tag

AES-GCM generates an authentication tag. During decryption, this tag is verified.

If the encrypted data has been modified or the wrong key is supplied, authentication fails.

---

# 11. Important Notes

- Do not forget the encryption key.
- Keep the encrypted `.enc` file and key safe.
- Losing the key means the encrypted file cannot normally be decrypted.
- Do not modify encrypted data unless you are intentionally testing tampering detection.
- Keep the Flask terminal running while using the application.
- The application runs locally by default at `127.0.0.1:5000`.
- No user account or login is required.

---

# 12. Troubleshooting

### Check Python

```powershell
python --version
```

If Python is not found, install Python and add it to PATH.

### Flask is not installed

```powershell
pip install flask
```

### Cryptography is not installed

```powershell
pip install cryptography
```

### Application does not open

Make sure the server is running:

```powershell
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

### Port 5000 is already in use

Stop the application using port 5000, or change the port in `app.py`.

---

# 13. Quick Start

For an already configured project:

```powershell
cd C:\Users\Skill\Desktop\fileencrptionsys
.\venv\Scripts\Activate.ps1
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

---

# 14. Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python Flask |
| Encryption | AES-256-GCM |
| Key Derivation | PBKDF2-HMAC-SHA256 |
| Data Format | JSON + Base64 |
| Runtime | Python |
| Interface | Web Browser |

---

# 15. Project Workflow

### Encryption

```text
User File
    ↓
Secret Key / Password
    ↓
PBKDF2-HMAC-SHA256
    ↓
256-bit Encryption Key
    ↓
AES-256-GCM
    ↓
Encrypted JSON
    ↓
Encrypted .enc File
```

### Decryption

```text
Encrypted .enc File
    ↓
Secret Key / Password
    ↓
PBKDF2-HMAC-SHA256
    ↓
Authentication Verification
    ↓
AES-256-GCM Decryption
    ↓
Original File
```

If authentication fails, the original data is not returned.

import os
import json
import base64

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidTag

# Security settings
SALT_SIZE = 16
NONCE_SIZE = 12
KEY_SIZE = 32  # 256 bits
PBKDF2_ITERATIONS = 600_000


def derive_key(password, salt):
    """
    Convert the user's password into a 256-bit AES key.
    """

    if not password:
        raise ValueError("Password cannot be empty.")

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=KEY_SIZE,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )

    return kdf.derive(password.encode("utf-8"))


def encrypt_file(file_data, password, filename, mime_type):
    """
    Encrypt a file using AES-256-GCM.

    Returns a JSON string containing:
    - algorithm
    - KDF information
    - salt
    - nonce
    - original filename
    - MIME type
    - ciphertext
    """

    # Generate random salt
    salt = os.urandom(SALT_SIZE)

    # Derive AES-256 key from password
    key = derive_key(password, salt)

    # Generate random GCM nonce
    nonce = os.urandom(NONCE_SIZE)

    # Create AES-GCM cipher
    aesgcm = AESGCM(key)

    # Encrypt file
    ciphertext = aesgcm.encrypt(nonce, file_data, None)

    # Create encrypted file structure
    encrypted_package = {
        "version": 1,
        "algorithm": "AES-256-GCM",
        "kdf": "PBKDF2-HMAC-SHA256",
        "iterations": PBKDF2_ITERATIONS,
        "salt": base64.b64encode(salt).decode("utf-8"),
        "nonce": base64.b64encode(nonce).decode("utf-8"),
        "original_filename": filename,
        "mime_type": mime_type or "application/octet-stream",
        "ciphertext": base64.b64encode(ciphertext).decode("utf-8"),
    }

    # Convert package to JSON
    return json.dumps(encrypted_package, indent=2)


def decrypt_file(encrypted_data, password):
    """
    Decrypt an encrypted JSON package.

    AES-GCM automatically verifies the authentication tag.
    If the password is wrong or the file was modified,
    decryption fails.
    """

    try:
        # Convert bytes to JSON
        if isinstance(encrypted_data, bytes):
            encrypted_data = encrypted_data.decode("utf-8")

        package = json.loads(encrypted_data)

    except (UnicodeDecodeError, json.JSONDecodeError):
        raise ValueError("Invalid encrypted file format.")

    # Validate basic structure
    required_fields = [
        "version",
        "algorithm",
        "kdf",
        "iterations",
        "salt",
        "nonce",
        "original_filename",
        "mime_type",
        "ciphertext",
    ]

    for field in required_fields:
        if field not in package:
            raise ValueError(f"Invalid encrypted file: missing {field}.")

    # Check encryption format
    if package["algorithm"] != "AES-256-GCM":
        raise ValueError("Unsupported encryption algorithm.")

    if package["kdf"] != "PBKDF2-HMAC-SHA256":
        raise ValueError("Unsupported key derivation method.")

    if package["iterations"] != PBKDF2_ITERATIONS:
        raise ValueError("Unsupported PBKDF2 iteration count.")

    try:
        # Decode encrypted components
        salt = base64.b64decode(package["salt"])
        nonce = base64.b64decode(package["nonce"])
        ciphertext = base64.b64decode(package["ciphertext"])

    except Exception:
        raise ValueError("Invalid encrypted data.")

    # Validate sizes
    if len(salt) != SALT_SIZE:
        raise ValueError("Invalid salt.")

    if len(nonce) != NONCE_SIZE:
        raise ValueError("Invalid nonce.")

    if len(ciphertext) < 16:
        raise ValueError("Invalid ciphertext.")

    # Derive the same AES-256 key
    key = derive_key(password, salt)

    # Create cipher
    aesgcm = AESGCM(key)

    try:
        # Decrypt + authenticate
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)

    except InvalidTag:
        raise ValueError(
            "Authentication failed: incorrect key or file has been tampered with."
        )

    # Determine whether the original file is text
    try:
        text_data = plaintext.decode("utf-8")

        # Check if it looks like normal text
        printable_count = sum(
            char.isprintable() or char in "\n\r\t" for char in text_data
        )

        is_text = len(text_data) == 0 or printable_count / len(text_data) >= 0.90

    except UnicodeDecodeError:
        is_text = False
        text_data = None

    if is_text:
        return {
            "data": text_data,
            "filename": package["original_filename"],
            "is_binary": False,
            "encoding": "text",
            "size": len(plaintext),
            "mime_type": package["mime_type"],
        }

    # Binary file → Base64 for the JavaScript frontend
    return {
        "data": base64.b64encode(plaintext).decode("utf-8"),
        "filename": package["original_filename"],
        "is_binary": True,
        "encoding": "base64",
        "size": len(plaintext),
        "mime_type": package["mime_type"],
    }

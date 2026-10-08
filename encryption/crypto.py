import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def generate_key():
    """Generate a random 256-bit AES key."""
    return AESGCM.generate_key(bit_length=256)


def encrypt_file(file_data, key):
    """Encrypt file data using AES-256-GCM."""

    # Generate a unique 12-byte nonce
    nonce = os.urandom(12)

    # Create AES-GCM cipher
    aesgcm = AESGCM(key)

    # Encrypt the file
    encrypted_data = aesgcm.encrypt(nonce, file_data, None)

    return nonce, encrypted_data


def decrypt_file(encrypted_data, key, nonce):
    """Decrypt and authenticate the encrypted file."""

    aesgcm = AESGCM(key)

    # If the file was modified, this will raise an exception
    decrypted_data = aesgcm.decrypt(nonce, encrypted_data, None)

    return decrypted_data

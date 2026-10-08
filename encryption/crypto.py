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

    # Encrypt data.
    # AES-GCM automatically adds the authentication tag.
    ciphertext = aesgcm.encrypt(nonce, file_data, None)

    # Store nonce + ciphertext
    encrypted_file = nonce + ciphertext

    return encrypted_file


def decrypt_file(encrypted_file, key):
    """Decrypt and authenticate an encrypted file."""

    # First 12 bytes are the nonce
    nonce = encrypted_file[:12]

    # Remaining bytes contain ciphertext + authentication tag
    ciphertext = encrypted_file[12:]

    aesgcm = AESGCM(key)

    # This also verifies the authentication tag
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)

    return plaintext

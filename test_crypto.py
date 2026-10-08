from encryption.crypto import generate_key, encrypt_file, decrypt_file

# Original data
original_data = b"Hello! This is my secret file."


# Generate AES-256 key
key = generate_key()

print("1. Key generated successfully.")


# Encrypt
nonce, encrypted_data = encrypt_file(original_data, key)

print("2. File encrypted successfully.")


# Normal decryption
decrypted_data = decrypt_file(encrypted_data, key, nonce)

print("3. File decrypted successfully.")
print("   Decrypted data:", decrypted_data.decode())


# Verify original data
if original_data == decrypted_data:
    print("4. SUCCESS: Original and decrypted data match!")


# -----------------------------------
# TAMPERING TEST
# -----------------------------------

print("\n5. Testing tampering detection...")

# Modify one byte of the encrypted data
tampered_data = bytearray(encrypted_data)
tampered_data[0] ^= 1
tampered_data = bytes(tampered_data)


try:
    decrypt_file(tampered_data, key, nonce)

    print("ERROR: Tampering was NOT detected!")

except Exception:
    print("SUCCESS: Tampering detected!")
    print("AES-GCM rejected the modified file.")

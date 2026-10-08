from encryption.crypto import generate_key, encrypt_file, decrypt_file

# Original message
original_data = b"Hello! This is my secret file."


# Generate AES-256 key
key = generate_key()

print("Key generated successfully.")


# Encrypt
nonce, encrypted_data = encrypt_file(original_data, key)

print("File encrypted successfully.")
print("Encrypted data:", encrypted_data)


# Decrypt
decrypted_data = decrypt_file(encrypted_data, key, nonce)

print("File decrypted successfully.")
print("Decrypted data:", decrypted_data.decode())


# Check result
if original_data == decrypted_data:
    print("SUCCESS: Original and decrypted data match!")
else:
    print("ERROR: Data does not match!")

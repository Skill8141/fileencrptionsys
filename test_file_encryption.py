from encryption.crypto import generate_key, encrypt_file, decrypt_file

# Read original file
with open("test_files/secret.txt", "rb") as file:
    original_data = file.read()

print("Original file read successfully.")


# Generate key
key = generate_key()

print("AES-256 key generated.")
print("Key:", key.hex())


# Encrypt
encrypted_file = encrypt_file(original_data, key)

with open("test_files/secret.enc", "wb") as file:
    file.write(encrypted_file)

print("File encrypted successfully.")


# Decrypt
with open("test_files/secret.enc", "rb") as file:
    encrypted_file = file.read()

decrypted_data = decrypt_file(encrypted_file, key)

with open("test_files/secret_decrypted.txt", "wb") as file:
    file.write(decrypted_data)

print("File decrypted successfully.")


# Verify
if original_data == decrypted_data:
    print("SUCCESS: Files are identical!")
else:
    print("ERROR: Files are different!")

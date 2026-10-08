from encryption.crypto import generate_key, encrypt_file, decrypt_file

# -----------------------------------
# READ ORIGINAL FILE
# -----------------------------------

with open("test_files/secret.txt", "rb") as file:
    original_data = file.read()

print("Original file read successfully.")


# -----------------------------------
# GENERATE KEY
# -----------------------------------

key = generate_key()

print("AES-256 key generated.")


# -----------------------------------
# ENCRYPT FILE
# -----------------------------------

nonce, encrypted_data = encrypt_file(original_data, key)

with open("test_files/secret.enc", "wb") as file:
    file.write(encrypted_data)

print("File encrypted successfully.")


# -----------------------------------
# DECRYPT FILE
# -----------------------------------

with open("test_files/secret.enc", "rb") as file:
    encrypted_data = file.read()

decrypted_data = decrypt_file(encrypted_data, key, nonce)

with open("test_files/secret_decrypted.txt", "wb") as file:
    file.write(decrypted_data)

print("File decrypted successfully.")


# -----------------------------------
# VERIFY
# -----------------------------------

if original_data == decrypted_data:
    print("SUCCESS: Files are identical!")
else:
    print("ERROR: Files are different!")

from flask import Flask, render_template, request, jsonify
from encryption.crypto import encrypt_file, decrypt_file

app = Flask(__name__)


# -------------------------
# Home Page
# -------------------------
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/how-it-works")
def how_it_works():
    return render_template("how_it_works.html")


# -------------------------
# Encrypt File
# -------------------------
@app.route("/api/encrypt", methods=["POST"])
def encrypt():
    try:
        # Check file
        if "file" not in request.files:
            return jsonify({"success": False, "error": "No file selected."}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"success": False, "error": "No file selected."}), 400

        # Check password
        password = request.form.get("key", "")

        if not password:
            return (
                jsonify({"success": False, "error": "Encryption key is required."}),
                400,
            )

        # Read file into memory
        file_data = file.read()

        # Encrypt
        encrypted_data = encrypt_file(file_data, password, file.filename, file.mimetype)

        return jsonify(
            {
                "success": True,
                "data": encrypted_data,
                "filename": file.filename + ".enc",
                "encoding": "json",
                "size": len(encrypted_data),
                "mime_type": "application/json",
            }
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# -------------------------
# Decrypt File
# -------------------------
@app.route("/api/decrypt", methods=["POST"])
def decrypt():
    try:
        # Check file
        if "file" not in request.files:
            return (
                jsonify({"success": False, "error": "No encrypted file selected."}),
                400,
            )

        file = request.files["file"]

        if file.filename == "":
            return (
                jsonify({"success": False, "error": "No encrypted file selected."}),
                400,
            )

        # Check password
        password = request.form.get("key", "")

        if not password:
            return (
                jsonify({"success": False, "error": "Decryption key is required."}),
                400,
            )

        # Read encrypted file
        encrypted_data = file.read()

        # Decrypt
        result = decrypt_file(encrypted_data, password)

        return jsonify(
            {
                "success": True,
                "data": result["data"],
                "filename": result["filename"],
                "is_binary": result["is_binary"],
                "encoding": result["encoding"],
                "size": result["size"],
                "mime_type": result["mime_type"],
            }
        )

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400

    except Exception as e:
        return jsonify({"success": False, "error": "Decryption failed."}), 500


# -------------------------
# Run Flask
# -------------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

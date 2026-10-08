document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ==========================================
  // FILE VARIABLES
  // ==========================================

  let encryptFile = null;
  let decryptFile = null;

  let encryptedData = null;
  let encryptedFilename = null;

  let decryptedData = null;
  let decryptedFilename = null;
  let decryptedIsBinary = false;
  let decryptedMimeType = "application/octet-stream";

  // ==========================================
  // ENCRYPT ELEMENTS
  // ==========================================

  const encryptFileArea = document.getElementById("encryptFileArea");

  const encryptFileInput = document.getElementById("encryptFileInput");

  const encryptFileName = document.getElementById("encryptFileName");

  const encryptKey = document.getElementById("encryptKey");

  const encryptBtn = document.getElementById("encryptBtn");

  const encryptPreview = document.getElementById("encryptPreview");

  const encryptPreviewTag = document.getElementById("encryptPreviewTag");

  const encryptDownloadBtn = document.getElementById("encryptDownloadBtn");

  const encryptError = document.getElementById("encryptError");

  // ==========================================
  // DECRYPT ELEMENTS
  // ==========================================

  const decryptFileArea = document.getElementById("decryptFileArea");

  const decryptFileInput = document.getElementById("decryptFileInput");

  const decryptFileName = document.getElementById("decryptFileName");

  const decryptKey = document.getElementById("decryptKey");

  const decryptBtn = document.getElementById("decryptBtn");

  const decryptPreview = document.getElementById("decryptPreview");

  const decryptPreviewTag = document.getElementById("decryptPreviewTag");

  const decryptDownloadBtn = document.getElementById("decryptDownloadBtn");

  const decryptError = document.getElementById("decryptError");

  // ==========================================
  // CHECK ELEMENTS
  // ==========================================

  console.log("CipherVault JS started");

  if (!encryptFileInput) {
    console.error("encryptFileInput not found");
    return;
  }

  if (!decryptFileInput) {
    console.error("decryptFileInput not found");
    return;
  }

  // ==========================================
  // FORMAT FILE SIZE
  // ==========================================

  function formatBytes(bytes) {
    if (bytes === 0) {
      return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB"];

    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return (bytes / Math.pow(1024, index)).toFixed(2) + " " + units[index];
  }

  // ==========================================
  // UPDATE BUTTONS
  // ==========================================

  function updateButtons() {
    encryptBtn.disabled = !(encryptFile && encryptKey.value.trim());

    decryptBtn.disabled = !(decryptFile && decryptKey.value.trim());
  }

  // ==========================================
  // ENCRYPT FILE
  // ==========================================

  encryptFileArea.addEventListener("click", function (event) {
    // Don't reopen if click somehow comes
    // directly from the input.
    if (event.target === encryptFileInput) {
      return;
    }

    encryptFileInput.click();
  });

  encryptFileInput.addEventListener("change", function () {
    console.log("Encrypt input changed");

    console.log("Files:", this.files);

    if (!this.files || this.files.length === 0) {
      console.log("No encryption file selected");

      return;
    }

    encryptFile = this.files[0];

    console.log("Selected:", encryptFile.name);

    encryptFileName.textContent =
      encryptFile.name + " · " + formatBytes(encryptFile.size);

    encryptFileName.classList.add("has-file");

    encryptError.textContent = "";

    updateButtons();
  });

  // ==========================================
  // DECRYPT FILE
  // ==========================================

  decryptFileArea.addEventListener("click", function (event) {
    if (event.target === decryptFileInput) {
      return;
    }

    decryptFileInput.click();
  });

  decryptFileInput.addEventListener("change", function () {
    console.log("Decrypt input changed");

    if (!this.files || this.files.length === 0) {
      return;
    }

    decryptFile = this.files[0];

    console.log("Selected:", decryptFile.name);

    decryptFileName.textContent =
      decryptFile.name + " · " + formatBytes(decryptFile.size);

    decryptFileName.classList.add("has-file");

    decryptError.textContent = "";

    updateButtons();
  });

  // ==========================================
  // DRAG AND DROP - ENCRYPT
  // ==========================================

  encryptFileArea.addEventListener("dragover", function (event) {
    event.preventDefault();

    encryptFileArea.classList.add("drag-over");
  });

  encryptFileArea.addEventListener("dragleave", function () {
    encryptFileArea.classList.remove("drag-over");
  });

  encryptFileArea.addEventListener("drop", function (event) {
    event.preventDefault();

    encryptFileArea.classList.remove("drag-over");

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      encryptFile = event.dataTransfer.files[0];

      encryptFileName.textContent =
        encryptFile.name + " · " + formatBytes(encryptFile.size);

      encryptFileName.classList.add("has-file");

      updateButtons();
    }
  });

  // ==========================================
  // DRAG AND DROP - DECRYPT
  // ==========================================

  decryptFileArea.addEventListener("dragover", function (event) {
    event.preventDefault();

    decryptFileArea.classList.add("drag-over");
  });

  decryptFileArea.addEventListener("dragleave", function () {
    decryptFileArea.classList.remove("drag-over");
  });

  decryptFileArea.addEventListener("drop", function (event) {
    event.preventDefault();

    decryptFileArea.classList.remove("drag-over");

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      decryptFile = event.dataTransfer.files[0];

      decryptFileName.textContent =
        decryptFile.name + " · " + formatBytes(decryptFile.size);

      decryptFileName.classList.add("has-file");

      updateButtons();
    }
  });

  // ==========================================
  // PASSWORD INPUT
  // ==========================================

  encryptKey.addEventListener("input", function () {
    encryptError.textContent = "";

    updateButtons();
  });

  decryptKey.addEventListener("input", function () {
    decryptError.textContent = "";

    updateButtons();
  });

  // ==========================================
  // SHOW / HIDE PASSWORD
  // ==========================================

  document.querySelectorAll(".toggle-key").forEach(function (button) {
    button.addEventListener("click", function () {
      const input = document.getElementById(button.dataset.target);

      if (!input) {
        return;
      }

      if (input.type === "password") {
        input.type = "text";
      } else {
        input.type = "password";
      }
    });
  });

  // ==========================================
  // ENCRYPT
  // ==========================================

  encryptBtn.addEventListener("click", async function () {
    encryptError.textContent = "";

    if (!encryptFile) {
      encryptError.textContent = "Please select a file.";

      return;
    }

    const password = encryptKey.value.trim();

    if (!password) {
      encryptError.textContent = "Please enter an encryption key.";

      return;
    }

    const formData = new FormData();

    formData.append("file", encryptFile);

    formData.append("key", password);

    encryptBtn.disabled = true;

    const text = encryptBtn.querySelector(".btn-text");

    if (text) {
      text.textContent = "Encrypting...";
    }

    try {
      const response = await fetch("/api/encrypt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Encryption failed.");
      }

      encryptedData = data.data;

      encryptedFilename = data.filename || encryptFile.name + ".enc";

      encryptPreview.textContent = encryptedData;

      encryptPreview.classList.remove("empty-state");

      encryptPreviewTag.textContent = "JSON";

      encryptDownloadBtn.disabled = false;
    } catch (error) {
      console.error(error);

      encryptError.textContent = error.message || "Encryption failed.";
    } finally {
      encryptBtn.disabled = false;

      if (text) {
        text.textContent = "Encrypt & Preview";
      }

      updateButtons();
    }
  });

  // ==========================================
  // DOWNLOAD ENCRYPTED FILE
  // ==========================================

  encryptDownloadBtn.addEventListener("click", function () {
    if (!encryptedData) {
      return;
    }

    const blob = new Blob([encryptedData], {
      type: "application/json",
    });

    download(blob, encryptedFilename);
  });

  // ==========================================
  // DECRYPT
  // ==========================================

  decryptBtn.addEventListener("click", async function () {
    decryptError.textContent = "";

    if (!decryptFile) {
      decryptError.textContent = "Please select an encrypted file.";

      return;
    }

    const password = decryptKey.value.trim();

    if (!password) {
      decryptError.textContent = "Please enter the decryption key.";

      return;
    }

    const formData = new FormData();

    formData.append("file", decryptFile);

    formData.append("key", password);

    decryptBtn.disabled = true;

    const text = decryptBtn.querySelector(".btn-text");

    if (text) {
      text.textContent = "Decrypting...";
    }

    try {
      const response = await fetch("/api/decrypt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Decryption failed.");
      }

      decryptedData = data.data;

      decryptedFilename = data.filename || "decrypted_file";

      decryptedIsBinary = Boolean(data.is_binary);

      decryptedMimeType = data.mime_type || "application/octet-stream";

      if (!decryptedIsBinary) {
        decryptPreview.textContent = decryptedData;

        decryptPreviewTag.textContent = "text";
      } else {
        decryptPreview.textContent =
          "✓ File decrypted successfully\n\n" + "File: " + decryptedFilename;

        decryptPreviewTag.textContent = "binary";
      }

      decryptPreview.classList.remove("empty-state");

      decryptDownloadBtn.disabled = false;
    } catch (error) {
      console.error(error);

      decryptError.textContent = error.message || "Decryption failed.";
    } finally {
      decryptBtn.disabled = false;

      if (text) {
        text.textContent = "Decrypt & Preview";
      }

      updateButtons();
    }
  });

  // ==========================================
  // DOWNLOAD DECRYPTED FILE
  // ==========================================

  decryptDownloadBtn.addEventListener("click", function () {
    if (!decryptedData) {
      return;
    }

    let blob;

    if (decryptedIsBinary) {
      const binary = atob(decryptedData);

      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      blob = new Blob([bytes], {
        type: decryptedMimeType,
      });
    } else {
      blob = new Blob([decryptedData], {
        type: decryptedMimeType || "text/plain",
      });
    }

    download(blob, decryptedFilename);
  });

  // ==========================================
  // DOWNLOAD FUNCTION
  // ==========================================

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // ==========================================
  // INITIAL STATE
  // ==========================================

  updateButtons();

  console.log("CipherVault ready.");
});

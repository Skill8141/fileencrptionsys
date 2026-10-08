/* =========================================================
   script.js — cipher·vault GUI  (Flask backend ready)
   =========================================================
   EXPECTED FLASK ENDPOINTS
   ---------------------------------------------------------
   POST /api/encrypt
     form-data: file=<file>, key=<string>
     response : { success: true, data: "<base64 ciphertext>",
                  filename: "original_name.enc" }
     error    : { success: false, error: "message" }

   POST /api/decrypt
     form-data: file=<file>, key=<string>
     response : { success: true,
                  data: "<base64 plaintext OR plain text>",
                  filename: "original_name",
                  is_binary: false }
     error    : { success: false, error: "message" }

   NOTE: Swap the API_BASE constant if your routes differ.
   ========================================================= */

(function () {
  "use strict";

  // ---------- CONFIG ----------
  const API_BASE = ""; // e.g. 'http://localhost:5000' — leave '' if same origin
  const ENDPOINTS = {
    encrypt: `${API_BASE}/api/encrypt`,
    decrypt: `${API_BASE}/api/decrypt`,
  };

  // ---------- DOM REFS ----------
  const el = (id) => document.getElementById(id);

  // Encrypt
  const encryptFileArea = el("encryptFileArea");
  const encryptFileInput = el("encryptFileInput");
  const encryptFileName = el("encryptFileName");
  const encryptKey = el("encryptKey");
  const encryptBtn = el("encryptBtn");
  const encryptPreview = el("encryptPreview");
  const encryptPreviewTag = el("encryptPreviewTag");
  const encryptDownload = el("encryptDownloadBtn");
  const encryptError = el("encryptError");

  // Decrypt
  const decryptFileArea = el("decryptFileArea");
  const decryptFileInput = el("decryptFileInput");
  const decryptFileName = el("decryptFileName");
  const decryptKey = el("decryptKey");
  const decryptBtn = el("decryptBtn");
  const decryptPreview = el("decryptPreview");
  const decryptPreviewTag = el("decryptPreviewTag");
  const decryptDownload = el("decryptDownloadBtn");
  const decryptError = el("decryptError");

  // ---------- STATE ----------
  const state = {
    encrypt: { file: null, resultBlob: null, resultName: null },
    decrypt: { file: null, resultBlob: null, resultName: null },
  };

  // =========================================================
  //  UTILITIES
  // =========================================================
  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  function setButtonLoading(btn, loading, label) {
    const textEl = btn.querySelector(".btn-text");
    const iconEl = btn.querySelector(".btn-icon");
    const spinnerEl = btn.querySelector(".spinner");

    if (loading) {
      btn.disabled = true;
      if (textEl) textEl.textContent = label || "Processing...";
      if (iconEl) iconEl.hidden = true;
      if (spinnerEl) spinnerEl.hidden = false;
    } else {
      if (textEl) textEl.textContent = label || "Process";
      if (iconEl) iconEl.hidden = false;
      if (spinnerEl) spinnerEl.hidden = true;
    }
  }

  function resetPreview(box, tag, defaultTag) {
    box.textContent = "result will appear here";
    box.classList.add("empty-state");
    box.classList.remove("success-preview");
    if (tag) tag.textContent = defaultTag;
  }

  function showError(errorEl, message) {
    errorEl.textContent = message || "";
  }

  function clearError(errorEl) {
    errorEl.textContent = "";
  }

  // ---------- FILE PREVIEW TEXT DETECTION ----------
  function looksLikeText(str) {
    // Consider text if printable ASCII ratio is high
    if (!str || str.length === 0) return false;
    const sample = str.slice(0, 500);
    let printable = 0;
    for (let i = 0; i < sample.length; i++) {
      const code = sample.charCodeAt(i);
      if (
        code === 9 ||
        code === 10 ||
        code === 13 ||
        (code >= 32 && code <= 126)
      ) {
        printable++;
      }
    }
    return printable / sample.length > 0.9;
  }

  // =========================================================
  //  FILE SELECTION
  // =========================================================
  function attachFileInput(input, fileNameEl, onFileReady) {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      fileNameEl.textContent = `${file.name} · ${formatBytes(file.size)}`;
      fileNameEl.classList.add("has-file");
      onFileReady(file);
    });
  }

  // Drag & drop
  function attachDropZone(area, input, fileNameEl, onFileReady) {
    ["dragenter", "dragover"].forEach((evt) => {
      area.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        area.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      area.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        area.classList.remove("dragover");
      });
    });

    area.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (!file) return;
      // Sync the hidden input so form-data works nicely
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;

      fileNameEl.textContent = `${file.name} · ${formatBytes(file.size)}`;
      fileNameEl.classList.add("has-file");
      onFileReady(file);
    });
  }

  // =========================================================
  //  ENABLE / DISABLE BUTTONS
  // =========================================================
  function refreshEncryptBtn() {
    const ready = state.encrypt.file && encryptKey.value.trim().length > 0;
    encryptBtn.disabled = !ready;
  }

  function refreshDecryptBtn() {
    const ready = state.decrypt.file && decryptKey.value.trim().length > 0;
    decryptBtn.disabled = !ready;
  }

  // =========================================================
  //  TOGGLE KEY VISIBILITY
  // =========================================================
  document.querySelectorAll(".toggle-key").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = el(btn.getAttribute("data-target"));
      if (!target) return;
      const isPassword = target.getAttribute("type") === "password";
      target.setAttribute("type", isPassword ? "text" : "password");
      btn.textContent = isPassword ? "🙈" : "👁️";
    });
  });

  // =========================================================
  //  ENCRYPT FLOW
  // =========================================================
  attachFileInput(encryptFileInput, encryptFileName, (file) => {
    state.encrypt.file = file;
    state.encrypt.resultBlob = null;
    state.encrypt.resultName = null;
    resetPreview(encryptPreview, encryptPreviewTag, "base64");
    encryptDownload.disabled = true;
    clearError(encryptError);
    refreshEncryptBtn();
  });

  attachDropZone(encryptFileArea, encryptFileInput, encryptFileName, (file) => {
    state.encrypt.file = file;
    state.encrypt.resultBlob = null;
    state.encrypt.resultName = null;
    resetPreview(encryptPreview, encryptPreviewTag, "base64");
    encryptDownload.disabled = true;
    clearError(encryptError);
    refreshEncryptBtn();
  });

  encryptKey.addEventListener("input", () => {
    clearError(encryptError);
    refreshEncryptBtn();
  });

  encryptBtn.addEventListener("click", async () => {
    const file = state.encrypt.file;
    const key = encryptKey.value.trim();

    if (!file) return showError(encryptError, "Please select a file.");
    if (!key) return showError(encryptError, "Encryption key is required.");

    clearError(encryptError);
    setButtonLoading(encryptBtn, true, "Encrypting...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);

      const response = await fetch(ENDPOINTS.encrypt, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Encryption failed.");
      }

      // Build preview
      const previewText =
        typeof data.data === "string" ? data.data : JSON.stringify(data.data);

      encryptPreview.textContent =
        previewText.length > 600
          ? previewText.slice(0, 600) + "\n… (truncated)"
          : previewText;
      encryptPreview.classList.remove("empty-state");
      encryptPreview.classList.add("success-preview");
      encryptPreviewTag.textContent = data.encoding || "base64";

      // Prepare download blob
      const blob = new Blob([previewText], { type: "application/json" });
      state.encrypt.resultBlob = blob;
      state.encrypt.resultName = data.filename || file.name + ".enc";
      encryptDownload.disabled = false;
    } catch (err) {
      console.error("[encrypt]", err);
      showError(encryptError, err.message || "Encryption failed.");
      resetPreview(encryptPreview, encryptPreviewTag, "base64");
      encryptDownload.disabled = true;
    } finally {
      setButtonLoading(encryptBtn, false, "Encrypt & Preview");
      refreshEncryptBtn();
    }
  });

  encryptDownload.addEventListener("click", () => {
    const { resultBlob, resultName } = state.encrypt;
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resultName || "encrypted.enc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // =========================================================
  //  DECRYPT FLOW
  // =========================================================
  attachFileInput(decryptFileInput, decryptFileName, (file) => {
    state.decrypt.file = file;
    state.decrypt.resultBlob = null;
    state.decrypt.resultName = null;
    resetPreview(decryptPreview, decryptPreviewTag, "text");
    decryptDownload.disabled = true;
    clearError(decryptError);
    refreshDecryptBtn();
  });

  attachDropZone(decryptFileArea, decryptFileInput, decryptFileName, (file) => {
    state.decrypt.file = file;
    state.decrypt.resultBlob = null;
    state.decrypt.resultName = null;
    resetPreview(decryptPreview, decryptPreviewTag, "text");
    decryptDownload.disabled = true;
    clearError(decryptError);
    refreshDecryptBtn();
  });

  decryptKey.addEventListener("input", () => {
    clearError(decryptError);
    refreshDecryptBtn();
  });

  decryptBtn.addEventListener("click", async () => {
    const file = state.decrypt.file;
    const key = decryptKey.value.trim();

    if (!file) return showError(decryptError, "Please select a file.");
    if (!key) return showError(decryptError, "Decryption key is required.");

    clearError(decryptError);
    setButtonLoading(decryptBtn, true, "Decrypting...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);

      const response = await fetch(ENDPOINTS.decrypt, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Decryption failed.");
      }

      // --- Preview handling ---
      const isBinary = data.is_binary === true;
      let previewText;
      let tag;

      if (isBinary) {
        // data.data is base64 string of binary
        const sizeInfo = data.size ? ` (${formatBytes(data.size)})` : "";
        previewText = `[binary file]${sizeInfo}\n\n${(data.data || "").slice(0, 400)}…`;
        tag = "binary";
      } else {
        previewText = data.data || "";
        if (previewText.length > 600) {
          previewText = previewText.slice(0, 600) + "\n… (truncated)";
        }
        tag = looksLikeText(data.data) ? "text" : "data";
      }

      decryptPreview.textContent = previewText || "(empty result)";
      decryptPreview.classList.remove("empty-state");
      decryptPreview.classList.add("success-preview");
      decryptPreviewTag.textContent = tag;

      // --- Download blob ---
      let blob;
      if (isBinary) {
        // Convert base64 → binary
        const byteChars = atob(data.data);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        blob = new Blob([new Uint8Array(byteNumbers)], {
          type: data.mime_type || "application/octet-stream",
        });
      } else {
        blob = new Blob([data.data], {
          type: data.mime_type || "text/plain",
        });
      }

      state.decrypt.resultBlob = blob;
      state.decrypt.resultName =
        data.filename || file.name.replace(/\.enc$/i, "") || "decrypted";
      decryptDownload.disabled = false;
    } catch (err) {
      console.error("[decrypt]", err);
      showError(
        decryptError,
        err.message || "Decryption failed. Check your key.",
      );
      resetPreview(decryptPreview, decryptPreviewTag, "text");
      decryptDownload.disabled = true;
    } finally {
      setButtonLoading(decryptBtn, false, "Decrypt & Preview");
      refreshDecryptBtn();
    }
  });

  decryptDownload.addEventListener("click", () => {
    const { resultBlob, resultName } = state.decrypt;
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resultName || "decrypted";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // =========================================================
  //  INIT
  // =========================================================
  refreshEncryptBtn();
  refreshDecryptBtn();
})();

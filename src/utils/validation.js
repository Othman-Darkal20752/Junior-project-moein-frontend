export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^\d{1,10}$/;
  return phoneRegex.test(phone);
};

export const validateFileType = (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file, maxSizeMB = 50) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const getFileTypeIcon = (filename) => {
  const ext = getFileExtension(filename);
  if (ext === 'pdf') return '📄';
  if (ext === 'docx') return '📝';
  if (ext === 'pptx') return '📊';
  return '📎';
};



import { courseApi } from './api';

/**
 * رفع محاضرة
 */
export const uploadLecture = async (courseId, formData) => {
  const response = await courseApi.post(
    `/courses/${courseId}/lectures/upload/`,
    formData,
  );
  return response.data;
};

/**
 * جلب حالة المحاضرة (Polling)
 */
export const getLectureStatus = async (lectureId) => {
  const response = await courseApi.get(`/lectures/${lectureId}/`);
  return response.data;
};

/**
 * جلب ملخص المحاضرة
 */
export const getLectureSummary = async (lectureId) => {
  const response = await courseApi.get(`/lectures/${lectureId}/summary/`);
  return response.data;
};
/**
 * تحديث اسم المحاضرة
 */
export const updateLectureName = async (lectureId, lectureName) => {
  const response = await courseApi.patch(
    `/lectures/${lectureId}/`,
    {
      lecture_name: lectureName,
    }
  );
  return response.data;
};
/**
 * حذف محاضرة
 */
export const deleteLecture = async (courseId, lectureId) => {
  const response = await courseApi.delete(
    `/courses/${courseId}/lectures/${lectureId}/delete/`
  );
  return response.data;
};


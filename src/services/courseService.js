import { courseApi } from './api';

export const getAllCourses = async () => {
  const response = await courseApi.get('/courses/');
  return Array.isArray(response.data)
    ? { courses: response.data }
    : response.data;
};

export const getCourse = async (courseId) => {
  const response = await courseApi.get(
    `/courses/${courseId}/lectures/`
  );
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await courseApi.post(
    '/courses/create/',
    courseData
  );
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await courseApi.put(
    `/courses/${courseId}/edit/`,
    courseData
  );
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const response = await courseApi.delete(
    `/courses/${courseId}/delete/`
  );
  return response.data;
};

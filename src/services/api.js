import axios from 'axios';
import { getToken, removeToken } from '../utils/tokenUtils';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://marielle-subchondral-rex.ngrok-free.dev/api';

const api = axios.create({
  baseURL,
});

/* =====================
   REQUEST INTERCEPTOR
===================== */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (
      token &&
      !config.url?.includes('/login/') &&
      !config.url?.includes('/signup/')
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================
   RESPONSE INTERCEPTOR
===================== */
api.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      const err = new Error(
        'HTML response received (ngrok warning page)'
      );
      err.isHtmlResponse = true;
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    // Network error
    if (!error.response) {
      error.isNetworkError = true;
      return Promise.reject(error);
    }

    // Unauthorized
    if (
      error.response?.status === 401 &&
      !error.config.url.includes('/login/')
    ) {
      removeToken();
      window.location.href = '/login';
    }


    return Promise.reject(error);
  }
);

export const accountApi = api;
export const courseApi = api;


// urlpatterns = [
//   path('signup/', views.signup, name='signup'),
//   path('login/', views.login, name='login'),
//   path('delete/', views.delete_account, name='delete-account'),
//   path('edit/', views.edit_account, name='edit-account'),
//   path('decode-token/', views.decode_token_contents, name='decode-token'),
//   path('check-student/<uuid:student_id>/', views.check_student_exists, name='check-student'),
//   path('check-user/<uuid:user_id>/', views.check_user_exists, name='check-user'),
//   path('me/', views.get_current_user, name='current-user'),

// ]

// urlpatterns = [
//   # Course management
//   path('courses/', views.get_my_courses, name='get-my-courses'),          # GET all courses
//   path('courses/create/', views.create_course, name='create-course'),     # POST create course
//   path('courses/<uuid:course_id>/', views.get_course, name='get-course'), # GET specific course
//   path('courses/<uuid:course_id>/edit/', views.update_course, name='update-course'), # PUT update course
//   path('courses/<uuid:course_id>/delete/', views.delete_course, name='delete-course'), # DELETE course
//   path('courses/<uuid:course_id>/lectures/upload/', views.upload_lecture, name='upload-lecture'), # POST lecture
//   path('courses/<uuid:course_id>/lectures/<uuid:lecture_id>/update-name/', views.update_lecture_name, name='update-lecture-name'),
//   path('courses/<uuid:course_id>/lectures/<uuid:lecture_id>/delete/', views.delete_lecture, name='delete-lecture'),
//   path('delete-student-courses/<uuid:student_id>/', views.delete_student_courses),
//   path('courses/<uuid:course_id>/lectures/', views.get_course_lectures, name='get-course-lectures'), #GET ALL LECTURES FOR SPECIFIC COURSE
//   path('lectures/<uuid:lecture_id>/', views.get_lecture, name='get-lecture'),
//   path('media/<uuid:student_id>/<uuid:course_id>/<path:filename>/', views.serve_media_file, name='serve-media'),
//   path('lectures/<uuid:lecture_id>/summary/', views.get_lecture_summary, name='get-lecture-summary'),
  
// ]